import path from "path";
import { fileUtil } from "../src/services/fileUtil";

async function download() {
  let fileUrl = 'https://t7.baidu.com/it/u=1951548898,3927145&fm=193&f=GIF';
  await fileUtil.downloadFileAsync(fileUrl, path.join(__dirname, '../tmp/temp.jpg'));
}

download();