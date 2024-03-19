import { excelUtil } from './excel';

class JsonUtil {

  safeParseJson(str:string) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }

  jsonToExcel(arrayItem: Record<string, any>[], excelPath: string) {
    const firstLine = Object.keys(arrayItem[0]);
    if (!firstLine) {
      return;
    }
    excelUtil.saveExcelData(excelPath, [{ sheetName: 'sheet1', data: arrayItem }]);
  }

}

export const jsonUtil = new JsonUtil();