import { createDemoHandle } from "./demo-auth.utils";

describe("demo identity", () => {
  it("creates a stable public handle from the display name", () => {
    expect(createDemoHandle("Antoñyo Moon Walker")).toBe("antonyo_moon_walker");
  });

  it("falls back when the display name cannot form a valid handle", () => {
    expect(createDemoHandle("  A  ")).toBe("oyente_sonus");
  });
});
