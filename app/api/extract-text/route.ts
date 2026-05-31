import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["application/pdf"];

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (auth.response) return auth.response;

  const rateLimited = await checkRateLimit("extract-text", auth.user.id);
  if (rateLimited.limited) return rateLimited.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 415 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File exceeds the 5 MB limit." }, { status: 413 });
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
    return NextResponse.json({ error: "Failed to extract text." }, { status: 500 });
  }
}
