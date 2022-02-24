import { findArgument } from "../../../scripts/start/findArgument";

describe("Common.findArgument", () => {
  it("Should find my argument and it's value", () => {
    const args = ["--arg1", "value1"];
    const res = findArgument(args, "arg1");

    expect(res.exists).toBe(true);
    expect(res.value).toEqual("value1");
  });

  it("Should find my argument but not it's value", () => {
    const args = ["--arg1", "value1", "--arg2"];
    const res = findArgument(args, "arg2");

    expect(res.exists).toBe(true);
    expect(res.value).toBeUndefined();
  });

  it("Should not find my argument if he's malformed", () => {
    const args = ["arg1", "value1"];
    const res = findArgument(args, "arg1");

    expect(res.exists).toBe(false);
    expect(res.value).toBeUndefined();
  });

  it("Should not find my argument or it's value", () => {
    const args = ["--arg1", "value1"];
    const res = findArgument(args, "arg2");

    expect(res.exists).toBe(false);
    expect(res.value).toBeUndefined();
  });
});
