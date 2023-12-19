import xlsx from "node-xlsx";

class XlsHelper {
  readFromXls(path: string, needFirstLine: boolean = true) {
    const sheets = xlsx.parse(path);
    const contents: any = [];
    const lineStartIndex = needFirstLine ? 0 : 1;
    for (let i = 0; i < sheets.length; i++) {
      let sheet = sheets[i];
      let data = sheet.data;
      let contentOfSheet = [];

      for (let j = lineStartIndex; j < data.length; j++) {
        contentOfSheet.push(data[j]);
      }
      if (!contentOfSheet.length) {
        continue;
      }
      contents.push(contentOfSheet);
    }
    return contents;
  }
}

export const xlsHelper = new XlsHelper();
