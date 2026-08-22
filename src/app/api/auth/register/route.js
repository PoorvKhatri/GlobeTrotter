import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      firstName = "",
      lastName = "",
      email,
      password,
      phone = "",
      city = "",
      country = "",
      additionalInfo = "",
      photo = "",
    } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const name = `${firstName} ${lastName}`.trim() || email.split("@")[0];

    const user = await User.create({
      name,
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      city,
      country,
      additionalInfo,
      photo,
    });

    const token = signToken({ id: user._id.toString(), role: user.role });
    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
      },
    });
  } catch (err) {
    console.error("register error", err);
    if (err?.name === "MongoNetworkError" || err?.name === "MongooseServerSelectionError") {
      return NextResponse.json(
        { error: "The database is temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
