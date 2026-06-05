export type SupportedFileType = "pdf" | "docx" | "txt";

/** Shared accept attribute + size cap so every uploader stays consistent. */
export const ACCEPTED_FILE_EXTENSIONS = ".pdf,.docx,.txt";
export const ACCEPTED_FILE_LABEL = "PDF, DOCX, or TXT, max 5MB";
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/** Reasons extraction can fail in a way the UI should handle specially. */
export type ExtractionErrorCode = "image_based" | "empty" | "unsupported" | "failed";

/**
 * Error thrown by `extractTextFromFile` carrying a machine-readable `code` so
 * callers can branch (e.g. show the design-portfolio fallback for "image_based")
 * instead of treating every failure as a dead end.
 */
export class ExtractionError extends Error {
  code: ExtractionErrorCode;
  constructor(message: string, code: ExtractionErrorCode = "failed") {
    super(message);
    this.name = "ExtractionError";
    this.code = code;
  }
}

export function getFileType(file: File): SupportedFileType | null {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (extension === "docx") return "docx";
  if (extension === "txt") return "txt";

  // Fallback to MIME type
  if (file.type === "application/pdf") return "pdf";
  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "docx";
  if (file.type === "text/plain") return "txt";

  return null;
}

async function extractFromTxt(file: File): Promise<string> {
  return file.text();
}

async function extractFromDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractFromPdf(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/extract-text", { method: "POST", body: formData });
  const text = await res.text();

  let data: { text?: string; error?: string; code?: ExtractionErrorCode };
  try {
    data = JSON.parse(text);
  } catch {
    throw new ExtractionError(
      "PDF extraction failed. Please try a DOCX or TXT file instead.",
      "failed"
    );
  }

  if (!res.ok) {
    // 422 with code "image_based" means the PDF has no text layer (visual /
    // scanned portfolio). Surface it as a typed error so the UI can offer the
    // manual-summary fallback instead of a dead end.
    throw new ExtractionError(
      data.error || "Failed to extract PDF text.",
      data.code ?? "failed"
    );
  }
  return (data.text as string) ?? "";
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = getFileType(file);

  if (!fileType) {
    throw new ExtractionError(
      "Unsupported file type. Please upload a PDF, DOCX, or TXT file.",
      "unsupported"
    );
  }

  let result: string;
  switch (fileType) {
    case "txt":
      result = await extractFromTxt(file);
      break;
    case "docx":
      result = await extractFromDocx(file);
      break;
    case "pdf":
      return extractFromPdf(file); // PDF route already flags image_based/empty
  }

  // DOCX / TXT: an empty result means there was no readable text in the file.
  if (!result.trim()) {
    throw new ExtractionError(
      "We could not read any text from this file. It may be empty.",
      "empty"
    );
  }
  return result;
}
