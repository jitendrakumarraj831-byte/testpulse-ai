import { parseCsvText } from "@/lib/admin/question-parser";

/** Parses an uploaded .csv or .xlsx file into header-keyed row objects. Throws on unsupported/corrupt files. */
export async function parseSpreadsheetFile(
  file: File,
): Promise<Record<string, unknown>[]> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    const text = await file.text();
    return parseCsvText(text);
  }

  if (!name.endsWith(".xlsx")) {
    throw new Error("Unsupported file type — please upload a .xlsx or .csv file.");
  }

  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const headers: string[] = [];
  worksheet.getRow(1).eachCell((cell, columnNumber) => {
    headers[columnNumber] = String(cell.value ?? "").trim();
  });

  const rows: Record<string, unknown>[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: Record<string, unknown> = {};
    row.eachCell((cell, columnNumber) => {
      const header = headers[columnNumber];
      if (header) record[header] = cell.value;
    });
    if (Object.keys(record).length > 0) rows.push(record);
  });

  return rows;
}
