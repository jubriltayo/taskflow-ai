import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

/**
 * NextAuth.js v5 main configuration and export
 * This file is the entry point for authentication
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
