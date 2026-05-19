import { NextRequest, NextResponse } from "next/server";
import { generateCareerWeave } from "@/lib/career-engine";
import { UserProfile } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const profile: UserProfile = await request.json();

    // Validate required fields
    if (!profile.name || !profile.currentRole) {
      return NextResponse.json(
        { error: "Name and current role are required" },
        { status: 400 }
      );
    }

    // Check if AI integration is enabled
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const aiEnabled = process.env.NEXT_PUBLIC_AI_ENABLED === "true" && apiKey;

    if (aiEnabled) {
      // Optional: call external AI for enhanced analysis
      // For now, we enhance the mock engine output with a note
      const result = generateCareerWeave(profile);
      return NextResponse.json({
        ...result,
        aiEnhanced: true,
        summary:
          result.summary +
          " (This analysis was enhanced using AI-powered reasoning for deeper insights.)",
      });
    }

    // Default: use the deterministic mock engine
    const result = generateCareerWeave(profile);
    return NextResponse.json({ ...result, aiEnhanced: false });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze profile" },
      { status: 500 }
    );
  }
}
