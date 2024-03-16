import { CreateTableCommand, DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export interface DynamoDBUtilOptions {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export class DynamoDBUtil {
  private dbClient: DynamoDBClient;
  private documentClient: DynamoDBDocumentClient;

  constructor(options: DynamoDBUtilOptions) {
    if (!options) {
      throw new Error("params need");
    }
    this.dbClient = new DynamoDBClient({
      region: options.region,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    });
    this.documentClient = DynamoDBDocumentClient.from(this.dbClient);
  }

  getDbClient() {
    return this.dbClient;
  }

  getDocumentClient() {
    return this.documentClient;
  }

  async listTables() {
    const command = new ListTablesCommand({});
    const data = await this.dbClient.send(command);
    return data.TableNames ? data.TableNames : [];
  }

  async createTable(tableName: string, indexFieldNames: string[] = []) {
    const params: any = {
      TableName: tableName,
      AttributeDefinitions: [{ AttributeName: "uuid", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "uuid", KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
    };
    if (indexFieldNames.length) {
      params.GlobalSecondaryIndexes = [];
      for (let fieldName of indexFieldNames) {
        params.AttributeDefinitions.push({
          AttributeName: fieldName,
          AttributeType: "S",
        });
        params.GlobalSecondaryIndexes.push({
          IndexName: `${fieldName}Index`, // GSI的名称
          KeySchema: [
            {
              AttributeName: fieldName,
              KeyType: "HASH", // 分区键
            },
          ],
          Projection: {
            ProjectionType: "ALL", // 包括所有属性
          },
        });
      }
    }
    const command = new CreateTableCommand(params);
    return this.dbClient.send(command);
  }

  async create(tableName: string, item: Record<string, any>) {
    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });
    return this.documentClient.send(command);
  }

  async findByKey(tableName: string, keyName: string, keyValue: string) {
    const command = new GetCommand({
      TableName: tableName,
      Key: { [keyName]: keyValue },
    });
    return this.documentClient.send(command);
  }

  async findBySecondaryIndexKey(tableName: string, secondaryIndexName: string, secondaryIndexKey: string, secondaryIndexValue: any, attributesToReturn?: string[]) {
    const items: any[] = []; // 用于收集所有项目
    let lastEvaluatedKey = undefined; // 用于分页
    do {
      const params = {
        TableName: tableName,
        IndexName: secondaryIndexName,
        // 使用表达式属性名来避免使用保留关键字
        KeyConditionExpression: '#dt = :gsiPkVal',
        ExpressionAttributeNames: {
          '#dt': secondaryIndexKey,
        },
        ExpressionAttributeValues: {
          ':gsiPkVal': secondaryIndexValue,
        },
        ...(attributesToReturn
          ? { ProjectionExpression: attributesToReturn.join(', ') }
          : {}),
        ExclusiveStartKey: lastEvaluatedKey,
      };

      const response: any = await this.documentClient.send(new QueryCommand(params));
      items.push(...response.Items); // 将当前批次的项目添加到集合中

      lastEvaluatedKey = response.LastEvaluatedKey; // 更新LastEvaluatedKey以进行下一次查询
    } while (lastEvaluatedKey); // 如果LastEvaluatedKey存在，表示还有更多数据要查询
    return items;
  }

  async updateByKey(tableName: string, keyName: string, keyValue: string, objUpdated: Record<string, any>) {
    let updateExpression = "set ";
    let attributeValues: Record<string, any> = {};
    const entries = Object.entries(objUpdated);
    if (!entries.length) {
      throw new Error("objUpdated is empty");
    }
    const lastIndex = entries.length - 1;
    for (let i = 0; i < entries.length; i++) {
      let [k, v] = entries[i];
      updateExpression += `${k}=:${k}${i < lastIndex ? ", " : ""}`;
      attributeValues[`:${k}`] = v;
    }
    const command = new UpdateCommand({
      TableName: tableName,
      Key: { [keyName]: keyValue },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: attributeValues,
      ReturnValues: "UPDATED_NEW",
    });
    const result = await this.documentClient.send(command);
    return result.Attributes;
  }
}