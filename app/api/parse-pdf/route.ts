import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    const parser = new PDFParse({ data });
    const result = await parser.getText();

    // Clean up
    await parser.destroy();

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("PDF parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse PDF" },
      { status: 500 }
    );
  }
}
