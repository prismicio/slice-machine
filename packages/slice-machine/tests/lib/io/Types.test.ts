import fs from "fs";
import { describe, test } from "@jest/globals";
import {} from "../../../lib/io/Types";

describe("upsert", () => {
  describe("`@prismicio/types` is installed", () => {
    test("writes types if `generateTypes` is missing", () => {});

    test("writes types if `generateTypes` is `true`", () => {});
  });

  describe("`@prismicio/types` is not installed", () => {
    test("does not write types if `@prismicio/types` is not installed and `generateTypes` is missing", () => {});

    test("does not write types if `@prismicio/types` is installed and `generateTypes` is `false`", () => {});
  });
});
