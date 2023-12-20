import { expect } from "chai";
import { fileDownloadHelper } from "../src/downloadFile";
import fs from "fs";

describe("downloadFile.downloadFileAsync Tests", () => {
  it("should download success when url startwith https", (done) => {
    fileDownloadHelper
      .downloadFile(
        "https://t7.baidu.com/it/u=1819248061,230866778&fm=193&f=GIF",
        "./tmp/exampleHttps.jpeg"
      )
      .then((result) => {
        if (fs.existsSync("./tmp/exampleHttps.jpeg")) {
          done();
        }
      });
  });

  it("should download success when url startwith http", (done) => {
    fileDownloadHelper
      .downloadFile(
        "http://t7.baidu.com/it/u=2168645659,3174029352&fm=193&f=GIF",
        "./tmp/exampleHttp.jpeg"
      )
      .then((result) => {
        if (fs.existsSync("./tmp/exampleHttp.jpeg")) {
          done();
        }
      })
      .catch((e) => {
        console.error(e);
      });
  });
});
