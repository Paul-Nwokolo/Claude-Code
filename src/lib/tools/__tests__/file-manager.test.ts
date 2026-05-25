import { describe, test, expect, vi, beforeEach } from "vitest";
import { buildFileManagerTool } from "@/lib/tools/file-manager";
import { VirtualFileSystem } from "@/lib/file-system";

function makeFS() {
  const fs = new VirtualFileSystem();
  fs.createFile("/App.jsx", "export default function App() {}");
  fs.createDirectory("/components");
  fs.createFile("/components/Button.jsx", "export function Button() {}");
  return fs;
}

describe("buildFileManagerTool — rename", () => {
  test("successfully renames a file", async () => {
    const fs = makeFS();
    const tool = buildFileManagerTool(fs);

    const result = await tool.execute({ command: "rename", path: "/App.jsx", new_path: "/Main.jsx" });

    expect(result).toEqual({
      success: true,
      message: "Successfully renamed /App.jsx to /Main.jsx",
    });
    expect(fs.exists("/Main.jsx")).toBe(true);
    expect(fs.exists("/App.jsx")).toBe(false);
  });

  test("returns error when new_path is missing on rename", async () => {
    const fs = makeFS();
    const tool = buildFileManagerTool(fs);

    const result = await tool.execute({ command: "rename", path: "/App.jsx", new_path: undefined });

    expect(result).toEqual({
      success: false,
      error: "new_path is required for rename command",
    });
  });

  test("returns error when source path does not exist", async () => {
    const fs = makeFS();
    const tool = buildFileManagerTool(fs);

    const result = await tool.execute({ command: "rename", path: "/nonexistent.jsx", new_path: "/Other.jsx" });

    expect(result).toEqual({
      success: false,
      error: "Failed to rename /nonexistent.jsx to /Other.jsx",
    });
  });

  test("renames a directory", async () => {
    const fs = makeFS();
    const tool = buildFileManagerTool(fs);

    const result = await tool.execute({ command: "rename", path: "/components", new_path: "/ui" });

    expect(result.success).toBe(true);
    expect(fs.exists("/ui")).toBe(true);
  });
});

describe("buildFileManagerTool — delete", () => {
  test("successfully deletes a file", async () => {
    const fs = makeFS();
    const tool = buildFileManagerTool(fs);

    const result = await tool.execute({ command: "delete", path: "/App.jsx" });

    expect(result).toEqual({
      success: true,
      message: "Successfully deleted /App.jsx",
    });
    expect(fs.exists("/App.jsx")).toBe(false);
  });

  test("returns error when deleting a non-existent file", async () => {
    const fs = makeFS();
    const tool = buildFileManagerTool(fs);

    const result = await tool.execute({ command: "delete", path: "/ghost.jsx" });

    expect(result).toEqual({
      success: false,
      error: "Failed to delete /ghost.jsx",
    });
  });

  test("deletes a nested file", async () => {
    const fs = makeFS();
    const tool = buildFileManagerTool(fs);

    const result = await tool.execute({ command: "delete", path: "/components/Button.jsx" });

    expect(result.success).toBe(true);
    expect(fs.exists("/components/Button.jsx")).toBe(false);
  });
});

describe("buildFileManagerTool — tool definition", () => {
  test("tool has a description", () => {
    const fs = new VirtualFileSystem();
    const tool = buildFileManagerTool(fs);

    expect((tool as any).description).toBeTypeOf("string");
    expect((tool as any).description.length).toBeGreaterThan(0);
  });

  test("tool has parameters schema", () => {
    const fs = new VirtualFileSystem();
    const tool = buildFileManagerTool(fs);

    expect((tool as any).parameters).toBeDefined();
  });
});
