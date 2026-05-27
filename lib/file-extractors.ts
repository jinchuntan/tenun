export type SupportedFileType = "pdf" | "docx" | "txt";

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

  let data: { text?: string; error?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("PDF extraction failed. Please try a DOCX or TXT file instead.");
  }

  if (!res.ok) throw new Error(data.error || "Failed to extract PDF text.");
  return data.text as string;
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = getFileType(file);

  if (!fileType) {
    throw new Error(
      "Unsupported file type. Please upload a PDF, DOCX, or TXT file."
    );
  }

  switch (fileType) {
    case "txt":
      return extractFromTxt(file);
    case "docx":
      return extractFromDocx(file);
    case "pdf":
      return extractFromPdf(file);
  }
}
