import {
  getAuthErrorMessage,
  getPasswordValidationError,
  isValidHandle,
  sanitizeNextPath,
} from "./auth.utils";

describe("auth utilities", () => {
  it("keeps only local redirect paths", () => {
    expect(sanitizeNextPath("/profile/moonwalker?tab=music")).toBe(
      "/profile/moonwalker?tab=music",
    );
    expect(sanitizeNextPath("https://attacker.invalid")).toBe("/");
    expect(sanitizeNextPath("//attacker.invalid/path")).toBe("/");
    expect(sanitizeNextPath("/\\attacker.invalid")).toBe("/");
  });

  it("matches the configured password policy", () => {
    expect(getPasswordValidationError("short1")).not.toBeNull();
    expect(getPasswordValidationError("onlyletters")).not.toBeNull();
    expect(getPasswordValidationError("sonus2026")).toBeNull();
  });

  it("matches the database handle constraint", () => {
    expect(isValidHandle("moon.walker-84")).toBe(true);
    expect(isValidHandle("no spaces")).toBe(false);
    expect(isValidHandle("ab")).toBe(false);
  });

  it("does not leak whether an account exists on login errors", () => {
    expect(getAuthErrorMessage(new Error("Invalid login credentials"))).toBe(
      "El email o la contraseña no son correctos.",
    );
  });
});
