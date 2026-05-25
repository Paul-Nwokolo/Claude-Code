import { test, expect, vi, afterEach } from "vitest";
import { SignJWT } from "jose";

const mockGet = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({ get: mockGet, set: vi.fn(), delete: vi.fn() })
  ),
}));

import { getSession } from "@/lib/auth";

const SECRET = new TextEncoder().encode("development-secret-key");
const COOKIE_NAME = "auth-token";

async function makeToken(
  payload: Record<string, unknown>,
  expiresIn: string = "7d"
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(SECRET);
}

afterEach(() => {
  vi.clearAllMocks();
});

test("getSession returns null when no cookie is present", async () => {
  mockGet.mockReturnValue(undefined);

  const session = await getSession();

  expect(session).toBeNull();
  expect(mockGet).toHaveBeenCalledWith(COOKIE_NAME);
});

test("getSession returns the session payload for a valid token", async () => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await makeToken({
    userId: "user-123",
    email: "test@example.com",
    expiresAt,
  });
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();

  expect(session).not.toBeNull();
  expect(session?.userId).toBe("user-123");
  expect(session?.email).toBe("test@example.com");
});

test("getSession returns null for a malformed token string", async () => {
  mockGet.mockReturnValue({ value: "not-a-valid-jwt" });

  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null for a token signed with the wrong secret", async () => {
  const wrongSecret = new TextEncoder().encode("wrong-secret");
  const token = await new SignJWT({ userId: "user-123", email: "test@example.com" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(wrongSecret);
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null for an expired token", async () => {
  const token = await makeToken(
    { userId: "user-123", email: "test@example.com" },
    "-1s"
  );
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null when cookie value is an empty string", async () => {
  mockGet.mockReturnValue({ value: "" });

  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession preserves all payload fields from the token", async () => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await makeToken({
    userId: "abc-456",
    email: "user@domain.com",
    expiresAt,
  });
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();

  expect(session?.userId).toBe("abc-456");
  expect(session?.email).toBe("user@domain.com");
});
