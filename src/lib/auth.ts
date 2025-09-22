import { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";

/**
 * NextAuth.js configuration for TaskFlow application
 * Handles user authentication with credentials and database integration
 */
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "john@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Find user in database
        const user = await db.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        // Verify password
        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Return user object (password excluded for security)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist user id in JWT token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Send user id to the client
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`✅ User signed in: ${user.email}`);
    },
    async signOut({ session, token }) {
      console.log(`👋 User signed out`);
    },
  },
  debug: process.env.NODE_ENV === "development",
};

/**
 * Utility function to get current session server-side
 */
export { auth as getServerSession } from "@/auth";
