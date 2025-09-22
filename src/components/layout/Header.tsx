"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <h2 className="text-lg font-semibold">TaskFlow</h2>
      {session?.user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {session.user.name || session.user.email}
          </span>
          <Button variant="outline" onClick={() => signOut()}>
            Logout
          </Button>
        </div>
      ) : (
        <Button variant="default" onClick={() => (location.href = "/login")}>
          Login
        </Button>
      )}
    </header>
  );
}
