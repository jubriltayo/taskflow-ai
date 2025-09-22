import { hash, compare } from "bcryptjs";
import { db } from "./db";
import { AuthUser } from "@/types";

/**
 * Utility functions for authentication operations
 */

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(password, hashedPassword);
}

/**
 * Create a new user account
 */
export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<AuthUser> {
  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user in database
  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return user;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
    },
  });
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return user;
}

/**
 * Update user profile
 */
export async function updateUser(
  id: string,
  data: { name?: string; email?: string }
): Promise<AuthUser> {
  const user = await db.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return user;
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  // Get current user with password
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      password: true,
    },
  });

  if (!user?.password) {
    throw new Error("User not found");
  }

  // Verify current password
  const isCurrentPasswordValid = await verifyPassword(
    currentPassword,
    user.password
  );
  if (!isCurrentPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password and update
  const hashedNewPassword = await hashPassword(newPassword);
  await db.user.update({
    where: { id: userId },
    data: {
      password: hashedNewPassword,
    },
  });
}
