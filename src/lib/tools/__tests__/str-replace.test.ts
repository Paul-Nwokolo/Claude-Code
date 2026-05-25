import { describe, test, expect } from "vitest";
import { buildStrReplaceTool } from "@/lib/tools/str-replace";
import { VirtualFileSystem } from "@/lib/file-system";

function makeFS() {
  const fs = new VirtualFileSystem();
  fs.createFile("/App.jsx", "export default function App() {\n  return <div>Hello</div>;\n}");
  fs.createDirectory("/components");
  return fs;
}

describe("buildStrReplaceTool — view", () => {
  test("returns file contents for a view command", async () => {
    const fs = makeFS();
    const tool = buildStrReplaceTool(fs);

    const result = await tool.execute({ command: "view", path: "/App.jsx" });

    expect(result).toContain("Hello");
  });

  test("view with range returns partial content", async () => {
    const fs = makeFS();
    const tool = buildStrReplaceTool(fs);

    const result = await tool.execute({ command: "view", path: "/App.jsx", view_range: [1, 1] });

    expect(result).toContain("export default function App");
  });
});

describe("buildStrReplaceTool — create", () => {
  test("creates a new file with content", async () => {
    const fs = makeFS();
    const tool = buildStrReplaceTool(fs);

    await tool.execute({ command: "create", path: "/components/Button.jsx", file_text: "export function Button() {}" });

    expect(fs.exists("/components/Button.jsx")).toBe(true);
    expect(fs.readFile("/components/Button.jsx")).toBe("export function Button() {}");
  });

  test("creates a file with empty content when file_text is omitted", async () => {
    const fs = makeFS();
    const tool = buildStrReplaceTool(fs);

    await tool.execute({ command: "create", path: "/empty.jsx" });

    expect(fs.exists("/empty.jsx")).toBe(true);
    expect(fs.readFile("/empty.jsx")).toBe("");
  });

  test("creates intermediate directories", async () => {
    const fs = makeFS();
    const tool = buildStrReplaceTool(fs);

    await tool.execute({ command: "create", path: "/deep/nested/file.jsx", file_text: "const x = 1;" });

    expect(fs.exists("/deep/nested/file.jsx")).toBe(true);
  });
});

describe("buildStrReplaceTool — str_replace", () => {
  test("replaces a string in the file", async () => {
    const fs = makeFS();
    const tool = buildStrReplaceTool(fs);

    await tool.execute({ command: "str_replace", path: "/App.jsx", old_str: "Hello", new_str: "World" });

    expect(fs.readFile("/App.jsx")).toContain("World");
    expect(fs.readFile("/App.jsx")).not.toContain("Hello");
  });

  test("uses empty strings when old_str/new_str are omitted", async () => {
    const fs = makeFS();
    fs.createFile("/simple.jsx", "abc");
    const tool = buildStrReplaceTool(fs);

    // Omitting new_str treats it as ""
    await tool.execute({ command: "str_replace", path: "/simple.jsx", old_str: "abc" });

    expect(fs.readFile("/simple.jsx")).toBe("");
  });
});

describe("buildStrReplaceTool — insert", () => {
  test("inserts text at the specified line", async () => {
    const fs = makeFS();
    const tool = buildStrReplaceTool(fs);

    await tool.execute({ command: "insert", path: "/App.jsx", insert_line: 1, new_str: "// inserted comment" });

    expect(fs.readFile("/App.jsx")).toContain("// inserted comment");
  });

  test("defaults to line 0 when insert_line is omitted", async () => {
    const fs = makeFS();
    const tool = buildStrReplaceTool(fs);

    const result = await tool.execute({ command: "insert", path: "/App.jsx", new_str: "// top" });

    expect(result).toBeDefined();
  });
});

describe("buildStrReplaceTool — undo_edit", () => {
  test("returns an unsupported error message", async () => {
    const fs = makeFS();
    const tool = buildStrReplaceTool(fs);

    const result = await tool.execute({ command: "undo_edit", path: "/App.jsx" });

    expect(result).toContain("undo_edit command is not supported");
  });
});

describe("buildStrReplaceTool — tool definition", () => {
  test("has the correct id", () => {
    const fs = new VirtualFileSystem();
    const tool = buildStrReplaceTool(fs);

    expect(tool.id).toBe("str_replace_editor");
  });

  test("has a parameters schema", () => {
    const fs = new VirtualFileSystem();
    const tool = buildStrReplaceTool(fs);

    expect(tool.parameters).toBeDefined();
  });
});
