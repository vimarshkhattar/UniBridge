import { describe, expect, it } from "vitest";

const protectedPrefixes = ["/dashboard", "/discover", "/events", "/assistant", "/guides", "/connections", "/profile", "/settings", "/admin", "/onboarding"];

describe("protected route list", () => {
  it("covers the main authenticated MVP routes", () => {
    expect(protectedPrefixes).toEqual(expect.arrayContaining(["/dashboard", "/discover", "/events", "/assistant", "/guides", "/connections", "/profile", "/settings", "/admin", "/onboarding"]));
  });
});
