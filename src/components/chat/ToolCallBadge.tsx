"use client";

import { Loader2 } from "lucide-react";

type ToolInvocationState = "partial-call" | "call" | "result";

interface ToolInvocationBase {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

interface ToolInvocationResult extends ToolInvocationBase {
  state: "result";
  result: unknown;
}

interface ToolInvocationPending extends ToolInvocationBase {
  state: Exclude<ToolInvocationState, "result">;
}

type ToolInvocation = ToolInvocationResult | ToolInvocationPending;

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

function getFilename(path: unknown): string {
  if (typeof path !== "string" || !path) return "";
  return path.split("/").pop() || path;
}

export function getToolCallLabel(toolName: string, args: Record<string, unknown>): string {
  const filename = getFilename(args.path);

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":    return `Creating ${filename}`;
      case "str_replace":
      case "insert":    return `Editing ${filename}`;
      case "view":      return `Viewing ${filename}`;
      case "undo_edit": return `Reverting ${filename}`;
      default:          return filename || toolName;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename": return `Renaming ${filename}`;
      case "delete": return `Deleting ${filename}`;
      default:       return filename || toolName;
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, args, state } = toolInvocation;
  const isDone = state === "result" && (toolInvocation as ToolInvocationResult).result != null;
  const label = getToolCallLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
