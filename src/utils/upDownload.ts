import fs from 'fs';
import http from 'http';
import https from 'https';

class UpDownloadUtil {
  private downloadTask(uri: string, dest: string, modelIns: any) {
    return new Promise((resolve, reject) => {
      // 确保dest路径存在
      let file = fs.createWriteStream(dest);

      modelIns.get(uri, (res: any) => {
        if (res.statusCode !== 200) {
          reject(res.statusCode);
          return;
        }

        res.on('end', () => {
          // console.log("download end");
        });

        // 进度、超时等
        file
          .on('finish', () => {
            // console.log("finish write file" + uri);
            file.close(resolve);
          })
          .on('error', (err: any) => {
            fs.unlink(dest, () => {});
            reject(err.message);
          });

        res.pipe(file);
      });
    });
  }

  downloadFileAsync(uri: string, dest: string) {
    if (uri.startsWith('https://')) {
      return this.downloadTask(uri, dest, https);
    }
    return this.downloadTask(uri, dest, http);
  }
}

export const upDownloadUtil = new UpDownloadUtil();