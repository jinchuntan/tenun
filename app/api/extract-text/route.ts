import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer);

    if (!data.text?.trim()) {
      return NextResponse.json(
        { error: "Could not extract text. The PDF may be image-based or empty." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: data.text });
  } catch (err) {
    console.error("extract-text error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to extract text." },
      { status: 500 }
    );
  }
}
