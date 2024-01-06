import mysql, { Connection } from 'mysql2';
import { Client } from 'ssh2';


export interface MysqlConnectionParam{
  host: string,
  port: number,
  user: string,
  password: string,
  database: string,
  jumpServer?: {
    host: string,
    port: number,
    username: string,
    privateKey: Buffer,
  }
}

class MysqlUtil {
  queryAsync(mysqlConnection: Connection, sql: string) {
    return new Promise((res, rej) => {
      mysqlConnection.query(sql, (err: any, rows: any, fields: any) => {
        if (err) {
          return rej(err);
        }
        return res(rows);
      });
    });
  }

  getConnection(
    params: MysqlConnectionParam,
  ): Promise<{ mysqlConnection: Connection; closeConnection: Function }> {
    return new Promise((res, rej) => {
      const sshConfig = params.jumpServer;

      if (!sshConfig) {
        const mysqlConnection = mysql.createConnection(params);
        const closeConnection = () => {
          mysqlConnection.end();
        };
        return res({ mysqlConnection, closeConnection });
      }

      const ssh = new Client();
      ssh.connect(sshConfig);
      ssh.on('error', (err) => {
        return rej(err);
      });
      ssh.on('ready', () => {
        console.log('Connected to SSH server');
        ssh.forwardOut(
          sshConfig.host,
          sshConfig.port,
          params.host,
          params.port,
          (err, stream) => {
            if (err) {
              return rej(err);
            }
            const mysqlConnection = mysql.createConnection({
              stream,
              user: params.user,
              password: params.password,
              database: params.database,
            });
            const closeConnection = () => {
              mysqlConnection.end(() => {
                ssh.end();
              });
            };
            res({ mysqlConnection, closeConnection });
          },
        );
      });
    });
  }
}

export const mysqlUtil = new MysqlUtil();