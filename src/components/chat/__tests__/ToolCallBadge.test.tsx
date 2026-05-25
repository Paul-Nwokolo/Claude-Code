import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolCallLabel } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// --- getToolCallLabel unit tests ---

test("getToolCallLabel: str_replace_editor create", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "/App.jsx" })).toBe("Creating App.jsx");
});

test("getToolCallLabel: str_replace_editor str_replace", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "str_replace", path: "/components/Button.tsx" })).toBe("Editing Button.tsx");
});

test("getToolCallLabel: str_replace_editor insert", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "insert", path: "/src/index.ts" })).toBe("Editing index.ts");
});

test("getToolCallLabel: str_replace_editor view", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "view", path: "/App.jsx" })).toBe("Viewing App.jsx");
});

test("getToolCallLabel: str_replace_editor undo_edit", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" })).toBe("Reverting App.jsx");
});

test("getToolCallLabel: file_manager rename", () => {
  expect(getToolCallLabel("file_manager", { command: "rename", path: "/old.jsx", new_path: "/new.jsx" })).toBe("Renaming old.jsx");
});

test("getToolCallLabel: file_manager delete", () => {
  expect(getToolCallLabel("file_manager", { command: "delete", path: "/App.jsx" })).toBe("Deleting App.jsx");
});

test("getToolCallLabel: unknown tool falls back to toolName", () => {
  expect(getToolCallLabel("some_other_tool", { path: "/foo.js" })).toBe("some_other_tool");
});

test("getToolCallLabel: extracts filename from nested path", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "/src/components/Card.tsx" })).toBe("Creating Card.tsx");
});

// --- ToolCallBadge rendering tests ---

test("ToolCallBadge shows 'Creating' label for str_replace_editor create command", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("ToolCallBadge shows 'Editing' label for str_replace command", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "2",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/components/Card.tsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Editing Card.tsx")).toBeDefined();
});

test("ToolCallBadge shows spinner when state is 'call'", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "3",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge shows green dot when state is 'result'", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "4",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: "OK",
      }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolCallBadge shows spinner when state is 'partial-call'", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "5",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        state: "partial-call",
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolCallBadge shows 'Renaming' label for file_manager rename", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "6",
        toolName: "file_manager",
        args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" },
        state: "result",
        result: { success: true },
      }}
    />
  );
  expect(screen.getByText("Renaming old.jsx")).toBeDefined();
});

test("ToolCallBadge shows 'Deleting' label for file_manager delete", () => {
  render(
    <ToolCallBadge
      toolInvocation={{
        toolCallId: "7",
        toolName: "file_manager",
        args: { command: "delete", path: "/App.jsx" },
        state: "result",
        result: { success: true },
      }}
    />
  );
  expect(screen.getByText("Deleting App.jsx")).toBeDefined();
});
