import { NextResponse } from "next/server";
import { createUser } from "@/lib/auth-utils";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  try {
    const user = await createUser(email, password, name);
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
