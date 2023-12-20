import QRCode from "qrcode";
import fs from "fs";

export function generateQRCode(
  url: string,
  filePathWithoutSuffix: string,
  width: number = 240
) {
  return new Promise((res, rej) => {
    QRCode.toFile(
      `${filePathWithoutSuffix}.png`,
      url,
      { type: "png", width },
      function (err) {
        if (err) {
          return rej(err);
        }
        return res(null);
      }
    );
  });
}
