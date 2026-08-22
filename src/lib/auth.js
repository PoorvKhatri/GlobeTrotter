import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "./mongodb";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const AUTH_COOKIE = "gt_token";

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/** Set the auth cookie (HTTP-only). Call from a route handler / server action. */
export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
}

/**
 * Read the current authenticated user from the request cookie.
 * Returns a plain object (safe to serialize) or null.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded?.id) return null;

  await connectDB();
  const user = await User.findById(decoded.id).lean();
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    photo: user.photo,
    city: user.city,
    country: user.country,
    phone: user.phone,
    additionalInfo: user.additionalInfo,
    language: user.language,
    role: user.role,
    savedDestinations: user.savedDestinations || [],
    createdAt: user.createdAt,
  };
}

/** Guard for API routes — returns the decoded token payload or null. */
export async function getTokenPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
