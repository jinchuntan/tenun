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
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Set worker to use the bundled worker via CDN to avoid Next.js webpack issues
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
    .promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => (item.str as string) || "")
      .join(" ");
    pages.push(text);
  }

  return pages.join("\n\n");
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
