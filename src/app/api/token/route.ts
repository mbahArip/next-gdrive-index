import { type NextRequest, NextResponse } from "next/server";

import { Schema_File } from "~/types/schema";

import { CreateFileToken } from "~/actions/token";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const { data, error } = Schema_File.safeParse(body);
    if (error) throw new Error("Invalid request payload");

    const token = await CreateFileToken(data);
    if (!token.success) throw new Error(token.error);
    return NextResponse.json({ data: token.data });
  } catch (error) {
    const e = error as Error;
    const message = e.message.replace(/\[.*\]/, "").trim();
    const status = /\[.*\]/.exec(e.message)?.[0].replace(/\[|\]/g, "").trim() ?? 500;

    return NextResponse.json(
      {
        scope: "api/raw",
        message,
        cause: e.cause ?? "Unknown",
      },
      {
        status: Number(status),
      },
    );
  }
}
