import { assert } from "chai";
import { generateQRCode } from "../src/urlToQRCode";
import fs from "fs";

describe("urlToQRCode", () => {
  it("should generate one png if everything is right", (done) => {
    generateQRCode("www.baidu.com", "./tmp/baiduQRCode", 240).then(() => {
      if (fs.existsSync("./tmp/baiduQRCode.png")) {
        done();
      }
    });
  });
});
