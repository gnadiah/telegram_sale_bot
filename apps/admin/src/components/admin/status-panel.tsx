"use client";

import { AlertCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatusPanelProps = {
  actionLabel?: string;
  description: string;
  onAction?: () => void;
  title: string;
  tone?: "empty" | "error";
};

export function StatusPanel({
  actionLabel,
  description,
  onAction,
  title,
  tone = "empty"
}: StatusPanelProps) {
  const Icon = tone === "error" ? AlertCircle : Inbox;

  return (
    <div
      className={cn(
        "rounded-2xl border px-6 py-12 text-center shadow-soft",
        tone === "error" ? "border-rose-200 bg-rose-50" : "border-dashed border-border bg-slate-50"
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-12 w-12 items-center justify-center rounded-2xl",
          tone === "error" ? "bg-rose-100 text-rose-700" : "bg-white text-slate-500"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className={cn("mt-4 text-base font-medium", tone === "error" ? "text-rose-900" : "text-slate-900")}>
        {title}
      </p>
      <p className={cn("mt-2 text-sm", tone === "error" ? "text-rose-700" : "text-slate-500")}>{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5" type="button" variant={tone === "error" ? "default" : "outline"} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
