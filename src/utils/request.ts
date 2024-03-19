import http from 'http';
import https from 'https';

class RequestUtil {
  sendRequestAndGetDataStreaming(requestOptions: http.RequestOptions | https.RequestOptions, dataSend: string, handleWhenData: (df: string) => boolean) {
    const reqModel = requestOptions.hostname?.startsWith('https') ? https : http;
    return new Promise((resolve, reject) => {
      if (!requestOptions || !handleWhenData) {
        return reject(new Error('params error'));
      }
      let sendDataDone = false;
      const req = reqModel.request(requestOptions, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error('statusCode error:' + res.statusCode));
        }
        res.on('data', (df) => {
          try {
            sendDataDone = handleWhenData(df);
            if (!sendDataDone) {
              return;
            }
            resolve(true);
          } catch (e) {
            reject(e);
          }
        });
        res.on('end', () => {
          sendDataDone ? resolve(true) : reject(new Error('sendData not done'));
        });
      });
      // 将请求内容写入请求中
      req.write(dataSend);
      // 发送一次请求
      req.end();
      // 监听请求错误事件
      req.on('error', (err) => {
        reject(err);
      });
      // 超时监听
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('request timeout'));
      });
    });
  }
}

export const requestUtil = new RequestUtil();