import { db } from "@/lib/prisma";
import { sanitizeText } from "@/lib/utils";
import { SignUpSchema } from "@/lib/validators/auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = SignUpSchema.parse(body);

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        name: sanitizeText(name),
        email: normalizedEmail,
        password: hashedPassword,
        karma: 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { message: error.errors[0]?.message || "Invalid payload" },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
