import { NextResponse } from "next/server";

// PDF parsing is now handled client-side via pdfjs-dist.
// This route is kept as a fallback stub.
export async function POST() {
  return NextResponse.json(
    { error: "PDF parsing has moved client-side. Please refresh the page." },
    { status: 410 }
  );
}
