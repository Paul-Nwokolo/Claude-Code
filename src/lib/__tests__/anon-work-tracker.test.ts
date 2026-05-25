import { describe, test, expect, beforeEach } from "vitest";
import {
  setHasAnonWork,
  getHasAnonWork,
  getAnonWorkData,
  clearAnonWork,
} from "@/lib/anon-work-tracker";

const STORAGE_KEY = "uigen_has_anon_work";
const DATA_KEY = "uigen_anon_data";

beforeEach(() => {
  sessionStorage.clear();
});

describe("setHasAnonWork", () => {
  test("stores data when messages are non-empty", () => {
    const messages = [{ id: "1", role: "user", content: "hello" }];
    const fsData = { "/": { type: "directory" } };

    setHasAnonWork(messages, fsData);

    expect(sessionStorage.getItem(STORAGE_KEY)).toBe("true");
    expect(JSON.parse(sessionStorage.getItem(DATA_KEY)!)).toEqual({
      messages,
      fileSystemData: fsData,
    });
  });

  test("stores data when fileSystemData has more than one key", () => {
    const messages: any[] = [];
    const fsData = {
      "/": { type: "directory" },
      "/App.jsx": { type: "file", content: "export default function App() {}" },
    };

    setHasAnonWork(messages, fsData);

    expect(sessionStorage.getItem(STORAGE_KEY)).toBe("true");
  });

  test("does not store when messages are empty and fileSystemData has only root", () => {
    setHasAnonWork([], { "/": { type: "directory" } });

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(DATA_KEY)).toBeNull();
  });

  test("does not store when messages are empty and fileSystemData is empty", () => {
    setHasAnonWork([], {});

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("getHasAnonWork", () => {
  test("returns false when nothing is stored", () => {
    expect(getHasAnonWork()).toBe(false);
  });

  test("returns true after setHasAnonWork stores data", () => {
    setHasAnonWork([{ id: "1" }], {});

    expect(getHasAnonWork()).toBe(true);
  });

  test("returns false when STORAGE_KEY is not 'true'", () => {
    sessionStorage.setItem(STORAGE_KEY, "false");

    expect(getHasAnonWork()).toBe(false);
  });
});

describe("getAnonWorkData", () => {
  test("returns null when nothing is stored", () => {
    expect(getAnonWorkData()).toBeNull();
  });

  test("returns parsed data when stored", () => {
    const messages = [{ id: "1", role: "user", content: "test" }];
    const fileSystemData = { "/App.jsx": { type: "file", content: "" } };
    sessionStorage.setItem(DATA_KEY, JSON.stringify({ messages, fileSystemData }));

    const result = getAnonWorkData();

    expect(result).toEqual({ messages, fileSystemData });
  });

  test("returns null when stored data is malformed JSON", () => {
    sessionStorage.setItem(DATA_KEY, "not-valid-json{{{");

    expect(getAnonWorkData()).toBeNull();
  });
});

describe("clearAnonWork", () => {
  test("removes both keys from sessionStorage", () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    sessionStorage.setItem(DATA_KEY, JSON.stringify({ messages: [], fileSystemData: {} }));

    clearAnonWork();

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(DATA_KEY)).toBeNull();
  });

  test("does not throw when nothing is stored", () => {
    expect(() => clearAnonWork()).not.toThrow();
  });
});
