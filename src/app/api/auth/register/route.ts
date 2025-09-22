import { NextResponse } from "next/server";
import { createUser } from "@/lib/auth/utils";
import { RegisterSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = RegisterSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }
    const { email, password, name } = parsed.data;
    const user = await createUser(email, password, name ?? undefined);
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    const isConflict = message === "User with this email already exists";
    return NextResponse.json(
      {
        success: false,
        error: isConflict ? "User already exists" : "Internal server error",
      },
      { status: isConflict ? 409 : 500 }
    );
  }
}
