import xlsx from 'node-xlsx';
import fs from 'fs';

class ExcelUtil {
  // excel每个sheet的第一行默认是标题行，读取每一行数据之后，行成一个对象，然后把每一列的数据放到对象中
  public readExcelData(excelFilePath: string): { sheetName: string, row0: string[], data: { [k: string]: any }[] }[]{
    if (!fs.existsSync(excelFilePath)) {
      throw new Error('文件不存在');
    }
    const sheets = xlsx.parse(fs.readFileSync(excelFilePath));
    return sheets.map(sheet => {
      const sheetName = sheet.name;
      const data = sheet.data.slice(1);
      const row0: string[] = sheet.data[0].map((cell) => cell.toString());
      return {
        sheetName,
        row0,
        data: data.map(row => {
          const obj: { [k: string]: any } = {};
          row.forEach((cell, index) => {
            obj[row0[index]] = cell;
          });
          return obj;
        }),
      };
    });
  }

  // 将数据保存到excel文件中
  public saveExcelData(excelFilePath: string, excelData: { sheetName: string, data: { [k: string]: any }[] }[]) {
    const buffer = xlsx.build(excelData.map((sheet) => {
      const row0 = Object.keys(sheet.data[0]);
      return {
        name: sheet.sheetName,
        data: [row0].concat(sheet.data.map((row) => {
          return row0.map((col) => row[col]);
        })),
        options: {},
      }
    }));
    fs.writeFileSync(excelFilePath, buffer);
  }
  
}

export const excelUtil = new ExcelUtil();