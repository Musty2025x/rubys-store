
import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { releaseExpiredReservations } from "@/lib/inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET is not configured.");

      return NextResponse.json(
        { success: false, message: "Cron endpoint is not configured." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization") ?? "";
    const suppliedToken = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    const expectedBuffer = Buffer.from(cronSecret);
    const suppliedBuffer = Buffer.from(suppliedToken);

    const validToken =
      expectedBuffer.length === suppliedBuffer.length &&
      timingSafeEqual(expectedBuffer, suppliedBuffer);

    if (!validToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const releasedCount = await releaseExpiredReservations();

    return NextResponse.json({
      success: true,
      message: "Expired reservation cleanup completed.",
      releasedCount,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Reservation cleanup endpoint failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Reservation cleanup failed.",
      },
      { status: 500 }
    );
  }
}
