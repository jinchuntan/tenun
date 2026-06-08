import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { LIMITS } from "@/lib/api-validation";

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

    const buffer = Buffer.from(await file.arrayBuffer());

    // Magic-byte check: a genuine PDF starts with "%PDF". This catches files
    // that are renamed/mislabelled as PDF regardless of the reported MIME type.
    if (buffer.length < 4 || buffer.toString("latin1", 0, 4) !== "%PDF") {
      return NextResponse.json({ error: "This file does not look like a valid PDF." }, { status: 415 });
    }

    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
    const data = await pdfParse(buffer);

    if (!data.text?.trim()) {
      // No text layer — almost always a visual/scanned/image-exported PDF
      // (Canva, Figma, Adobe, etc.). Flag it so the client can offer the
      // manual project-summary fallback instead of a dead-end error.
      return NextResponse.json(
        {
          error:
            "We could not extract text from this file. This often happens with visual portfolios exported from Canva, Figma, or Adobe, or scanned/image-based PDFs.",
          code: "image_based",
        },
        { status: 422 }
      );
    }

    // Cap extracted text so an enormous PDF can't flood downstream AI calls.
    return NextResponse.json({ text: data.text.slice(0, LIMITS.RESUME) });
  } catch (err) {
    console.error("extract-text error:", err);
    return NextResponse.json({ error: "Failed to extract text." }, { status: 500 });
  }
}
