// 全名：amazon simple queue service
// 本质：托管队列，生产者往里塞，使用者轮训往外拉
// 优势：加密，持久化（消息保存N天），高可用
// 架构：
// 1. 生产者把数据打到sqs，sqs以冗余的方式在sqs服务器之间保存
// 2. 消费者拉取数据，得到消息A，消息A在可见性超时期间不会返回给后续的请求
// 3. 消费者从队列中删除A，以阻止A在可见性超时过期后被其他请求接收
import {
  ChangeMessageVisibilityCommand,
  CreateQueueCommand,
  DeleteMessageBatchCommand,
  DeleteMessageCommand,
  DeleteQueueCommand,
  GetQueueUrlCommand,
  Message,
  MessageAttributeValue,
  ReceiveMessageCommand,
  SQSClient,
  SendMessageCommand,
  SetQueueAttributesCommand,
  paginateListQueues,
} from '@aws-sdk/client-sqs';

export class AmazonSqs {
  private client: SQSClient;

  constructor() {
    this.client = new SQSClient({ apiVersion: '2012-11-05' });
  }

  get sqsClient() {
    return this.client;
  }

  async getQueueUrlList() {
    const paginatedQueues = paginateListQueues({ client: this.client }, {});
    const queueUrls: string[] = [];
    for await (const page of paginatedQueues) {
      if (page.QueueUrls?.length) {
        queueUrls.push(...page.QueueUrls);
      }
    }
    return queueUrls;
  }

  async receiveMessage(queueUrl: string) {
    const response = await this.client.send(
      new ReceiveMessageCommand({
        // AttributeNames: ['SentTimestamp'],
        MaxNumberOfMessages: 10,
        MessageAttributeNames: ['All'],
        QueueUrl: queueUrl,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 20,
      }),
    );
    return response.Messages;
  }

  async changeMessageVisible(
    queueUrl: string,
    message: Message,
    visiblityTimeoutSeconds: number,
  ) {
    const response = await this.client.send(
      new ChangeMessageVisibilityCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle,
        VisibilityTimeout: visiblityTimeoutSeconds,
      }),
    );
    return response;
  }

  async createQueue(sqsQueueName: string) {
    const command = new CreateQueueCommand({
      QueueName: sqsQueueName,
      Attributes: {
        DelaySeconds: '60',
        MessageRetentionPeriod: '86400',
      },
    });

    const response = await this.client.send(command);
    return response.QueueUrl;
  }

  async deleteMessage(queueUrl: string, messages: Message[]) {
    if (!messages) {
      return;
    }
    if (messages.length === 1) {
      await this.client.send(
        new DeleteMessageCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: messages[0].ReceiptHandle,
        }),
      );
      return;
    }
    await this.client.send(
      new DeleteMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: messages.map((message) => ({
          Id: message.MessageId,
          ReceiptHandle: message.ReceiptHandle,
        })),
      }),
    );
  }

  async deleteQueue(queueUrl: string) {
    const command = new DeleteQueueCommand({ QueueUrl: queueUrl });
    const response = await this.client.send(command);
    return response;
  }

  async getQueueUrl(queueName: string) {
    const command = new GetQueueUrlCommand({ QueueName: queueName });
    const response = await this.client.send(command);
    return response.QueueUrl;
  }

  async sendMessageToQueue(
    queueUrl: string,
    message: string,
    delaySeconds: number,
    messageAttributes: { [k: string]: MessageAttributeValue },
  ) {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      DelaySeconds: delaySeconds, // 消息在发送N秒后才能被消费
      MessageAttributes: messageAttributes,
      MessageBody: message, // 消息负载
    });

    const response = await this.client.send(command);
    return response;
  }

  async setQueueAttributes(
    queueUrl: string,
    attributesUpdate: { [k: string]: any },
  ) {
    const command = new SetQueueAttributesCommand({
      QueueUrl: queueUrl,
      Attributes: attributesUpdate,
    });

    const response = await this.client.send(command);
    return response;
  }

  async setReceiveMessageWaitTimeSeconds(
    queueUrl: string,
    waitSecondsWhenNoData: number,
  ) {
    // 设置长轮训：没消息时，服务端等待，知道超过等待时间或有数据
    return this.setQueueAttributes(queueUrl, {
      ReceiveMessageWaitTimeSeconds: waitSecondsWhenNoData,
    });
  }
}
