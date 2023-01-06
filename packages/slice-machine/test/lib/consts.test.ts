import { describe, test, expect } from "vitest";
import { API_ID_REGEX, API_ID_RETRO_COMPATIBLE_REGEX } from "@lib/consts";

describe("Constant", () => {
  test("API_ID_REGEX should block special characters except _", () => {
    expect(API_ID_REGEX.exec("my_a&p@i_id")).toBeFalsy();
    expect(API_ID_REGEX.exec("my§api§id")).toBeFalsy();
    expect(API_ID_REGEX.exec("my-api-id")).toBeFalsy();
    expect(API_ID_REGEX.exec("my_api_id")).toBeTruthy();
  });

  test("API_ID_RETRO_COMPATIBLE_REGEX should block special characters but still allow - and _", () => {
    expect(API_ID_RETRO_COMPATIBLE_REGEX.exec("my_a&p@i_id")).toBeFalsy();
    expect(API_ID_RETRO_COMPATIBLE_REGEX.exec("my§api§id")).toBeFalsy();
    expect(API_ID_RETRO_COMPATIBLE_REGEX.exec("my-api-id")).toBeTruthy();
    expect(API_ID_RETRO_COMPATIBLE_REGEX.exec("my_api_id")).toBeTruthy();
  });
});
