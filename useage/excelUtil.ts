import path from 'path';
import { excelUtil } from '../src/services/excelUtil';

// src/services/excelUtil.ts的使用示例
async function read() {
  const excelFilePath = path.join(__dirname, '../tmp/示例excel.xlsx');
  const excelData = excelUtil.readExcelData(excelFilePath);
  for (let sheet of excelData) {
    console.log(sheet);
  }
  excelData[0].data.push({
    name: '张三',
    age: 18,
    score: 60
  });
  excelData[1].data.push({
    x: 1,
    y: 2,
    color: '#333333',
  });
  excelUtil.saveExcelData(path.join(__dirname, '../tmp/示例excel2.xlsx'), excelData);
}

read();