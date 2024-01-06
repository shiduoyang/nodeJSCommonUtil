import { mysqlUtil } from "../src/db/mysqlUtil";
import fs from 'fs';

async function linkWithoutJumperServer() {
  let { mysqlConnection, closeConnection } = await mysqlUtil.getConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "solvelytestdev",
  });
  try {
    let tmpRecords = await mysqlUtil.queryAsync(mysqlConnection, "SELECT * FROM UserInfo limit 1");
    console.log(tmpRecords);
  } catch (e) {
    console.error(e);
  } finally {
    closeConnection(); 
  }
}

async function linkWithJumperServer() {
  let { mysqlConnection, closeConnection } = await mysqlUtil.getConnection({
    host: '',
    port: 3306,
    user: '',
    password: '',
    database: '',
    jumpServer: {
      host: '',
      port: 22,
      username: '',
      privateKey: fs.readFileSync('/Users/yangshiduo/.ssh/id_rsa'),
    },
  });
  try {
    let tmpRecords = await mysqlUtil.queryAsync(
      mysqlConnection,
      'SELECT * FROM UserInfo limit 1',
    );
    console.log(tmpRecords);
  } catch (e) {
    console.error(e);
  } finally {
    closeConnection();
  }
}

// linkWithoutJumperServer();
// linkWithJumperServer();