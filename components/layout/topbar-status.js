"use client";

import { Database, HardDrive, LogOut } from "lucide-react";
import { useAppData } from "@/components/providers/data-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** Shows the business name, where data is stored and (with MongoDB) sign out. */
export function TopbarStatus() {
  const { data, mode, userEmail, signOut } = useAppData();
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Badge
        className="border-stone-300 bg-card text-muted-foreground"
        title={
          mode === "local"
            ? "Data is saved in this browser (localStorage)"
            : `Connected to MongoDB${userEmail ? ` as ${userEmail}` : ""}`
        }
      >
        {mode === "local" ? <HardDrive className="size-3" /> : <Database className="size-3" />}
        {mode === "local" ? "Local data" : "MongoDB"}
      </Badge>
      {mode === "mongodb" && (
        <Button variant="ghost" size="sm" onClick={() => void signOut()}>
          <LogOut /> Sign out
        </Button>
      )}
    </div>
  );
}
