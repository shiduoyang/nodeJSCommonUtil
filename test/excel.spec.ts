import { assert } from "chai";
import { xlsHelper } from "../src/excel";

describe("ExcelUtil.readFromXls Tests", () => {
  const excelPath = "./tmp/excel示例文件.xlsx";
  const contents = xlsHelper.readFromXls(excelPath, true);

  it("contents.length should equals 3", () => {
    assert.equal(contents.length, 3);
  });

  it("contents should be right", () => {
    let rightContent = [
      [
        ["姓名", "课程", "分数"],
        ["王五", "语文", 100],
        ["赵六", "语文", 88],
      ],
      [
        ["姓名", "年龄"],
        ["张三", 24],
        ["李四", 25],
      ],
      [
        ["1层", 10],
        ["2层", 20],
        ["3层", 30],
      ],
    ];
    assert.equal(JSON.stringify(contents), JSON.stringify(rightContent));
  });

  it("content exclude firstLine if nessary", () => {
    const contents = xlsHelper.readFromXls(excelPath, false);
    let rightContent = [
      [
        ["王五", "语文", 100],
        ["赵六", "语文", 88],
      ],
      [
        ["张三", 24],
        ["李四", 25],
      ],
      [
        ["2层", 20],
        ["3层", 30],
      ],
    ];
    assert.equal(JSON.stringify(contents), JSON.stringify(rightContent));
  });
});
