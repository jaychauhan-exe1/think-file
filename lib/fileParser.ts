import { extractText } from "unpdf";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";

// Polyfill browser APIs for PDF parsing in Node.js
if (typeof global.DOMMatrix === "undefined") {
  // @ts-ignore
  global.DOMMatrix = class DOMMatrix {};
}
if (typeof global.ImageData === "undefined") {
  // @ts-ignore
  global.ImageData = class ImageData {};
}
if (typeof global.Path2D === "undefined") {
  // @ts-ignore
  global.Path2D = class Path2D {};
}

export interface ParsedFileResult {
  text: string;
  error?: string;
}

/**
 * Parses various file types and extracts text content
 * Supports: PDF, Word (doc/docx), Excel (xls/xlsx), CSV, and plain text files
 */
export async function parseFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ParsedFileResult> {
  try {
    // Normalize MIME type
    const type = mimeType.toLowerCase();
    const ext = fileName.toLowerCase().split(".").pop() || "";

    // PDF files
    if (type === "application/pdf" || ext === "pdf") {
      return await parsePDF(buffer);
    }

    // Word documents (.docx)
    if (
      type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === "docx"
    ) {
      return await parseDocx(buffer);
    }

    // Word documents (.doc) - older format
    if (type === "application/msword" || ext === "doc") {
      return await parseDoc(buffer);
    }

    // Excel files (.xlsx)
    if (
      type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      ext === "xlsx"
    ) {
      return await parseExcel(buffer);
    }

    // Excel files (.xls) - older format
    if (type === "application/vnd.ms-excel" || ext === "xls") {
      return await parseExcel(buffer);
    }

    // CSV files
    if (type === "text/csv" || ext === "csv") {
      return await parseCSV(buffer);
    }

    // Plain text files
    if (
      type.startsWith("text/") ||
      ["txt", "md", "json", "xml", "html", "css", "js", "ts", "tsx", "jsx"].includes(ext)
    ) {
      return parsePlainText(buffer);
    }

    // Fallback: try to parse as plain text
    return parsePlainText(buffer);
  } catch (error) {
    console.error("File parsing error:", error);
    return {
      text: "",
      error: `Failed to parse file: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function parsePDF(buffer: Buffer): Promise<ParsedFileResult> {
  try {
    const result = await extractText(new Uint8Array(buffer));
    const text = Array.isArray(result.text) ? result.text.join("\n") : (result.text || "");
    
    if (!text.trim()) {
      return { text: "", error: "PDF appears to be empty or contains only images" };
    }
    
    return { text };
  } catch (error) {
    console.error("PDF parsing error:", error);
    return {
      text: "",
      error: `Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function parseDocx(buffer: Buffer): Promise<ParsedFileResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result.value || !result.value.trim()) {
      return { text: "", error: "Word document appears to be empty" };
    }
    
    return { text: result.value };
  } catch (error) {
    console.error("DOCX parsing error:", error);
    return {
      text: "",
      error: `Failed to parse Word document: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function parseDoc(buffer: Buffer): Promise<ParsedFileResult> {
  // For older .doc files, mammoth can still attempt to parse
  try {
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result.value || !result.value.trim()) {
      return {
        text: "",
        error: "Older Word document format (.doc) may not be fully supported. Please convert to .docx",
      };
    }
    
    return { text: result.value };
  } catch (error) {
    console.error("DOC parsing error:", error);
    return {
      text: "",
      error: "Failed to parse .doc file. Please convert to .docx format for better compatibility.",
    };
  }
}

async function parseExcel(buffer: Buffer): Promise<ParsedFileResult> {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const allText: string[] = [];

    // Iterate through all sheets
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      
      // Add sheet name as a header
      allText.push(`\n=== Sheet: ${sheetName} ===\n`);
      
      // Convert sheet to CSV format for better text representation
      const csv = XLSX.utils.sheet_to_csv(sheet);
      allText.push(csv);
    });

    const text = allText.join("\n");
    
    if (!text.trim()) {
      return { text: "", error: "Excel file appears to be empty" };
    }
    
    return { text };
  } catch (error) {
    console.error("Excel parsing error:", error);
    return {
      text: "",
      error: `Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function parseCSV(buffer: Buffer): Promise<ParsedFileResult> {
  try {
    const csvText = buffer.toString("utf-8");
    
    // Parse CSV to validate and format it properly
    const records = parse(csvText, {
      skip_empty_lines: true,
      trim: true,
    });

    // Convert back to text with proper formatting
    const text = records
      .map((row: any[]) => row.join(", "))
      .join("\n");

    if (!text.trim()) {
      return { text: "", error: "CSV file appears to be empty" };
    }
    
    return { text };
  } catch (error) {
    console.error("CSV parsing error:", error);
    // If parsing fails, try to return as plain text
    const text = buffer.toString("utf-8");
    if (text.trim()) {
      return { text };
    }
    return {
      text: "",
      error: `Failed to parse CSV file: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

function parsePlainText(buffer: Buffer): ParsedFileResult {
  try {
    const text = buffer.toString("utf-8");
    
    // Check if the text contains too many non-printable characters (likely binary)
    const nonPrintableCount = (text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g) || []).length;
    const nonPrintableRatio = nonPrintableCount / text.length;
    
    if (nonPrintableRatio > 0.3) {
      return {
        text: "",
        error: "File appears to be binary and cannot be parsed as text. Please upload a supported file format.",
      };
    }
    
    if (!text.trim()) {
      return { text: "", error: "Text file appears to be empty" };
    }
    
    return { text };
  } catch (error) {
    console.error("Plain text parsing error:", error);
    return {
      text: "",
      error: `Failed to parse text file: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
