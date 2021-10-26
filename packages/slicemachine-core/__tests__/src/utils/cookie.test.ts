import { describe, expect, test, afterEach } from "@jest/globals";
import {
  parsePrismicAuthToken,
  serializeCookie,
  serializeCookies,
} from "../../../src/utils/cookie";

describe("cookie", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("parsePrismicAuthToken", () => {
    test("should extract correctly cookie from a well formed cookie string", () => {
      const cookieString =
        "SESSION=0a41c2a9944577c6000b5b1ffdbae884492641d6-T=_9T%27X0%2BIZM%3EPN8Y%3F7H44MRX8%3CD%5B%5EZ%2BW%27Q%2B+_G%3CSE7%5BAR6WS%3EB8%2BR%5C6V%2B%25D%29RGXSJ%3B&U=kevinj%40overlay-tech.com&I=09c00b56e4&C=19719956967e75293da8612c36d44427be2223f376e27bd9bbcf5080b072620e-1634750164799-1fdc0de28b3028b1196c2bfdfe6432242e6b8d0a05620980cc9405f6a8a5494648&D=1634725810; Path=/; SameSite=None; prismic-auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC.eyJ0eXBlIjoidXNlciIsImlkIjoiNjBjMGUzNzIxMTAwMDAyMjAwZDQxMGExIiwiZGF0ZSI6MTYzNDc1MDE2NCwiaWF0IjoxNjM0NzUwMTY0fQ.BuhlVAJATAPeQi-HQWEh0LwuXBoU4UpXk1XxWDILU38";
      const result = parsePrismicAuthToken(cookieString);
      expect(result).toBe(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC.eyJ0eXBlIjoidXNlciIsImlkIjoiNjBjMGUzNzIxMTAwMDAyMjAwZDQxMGExIiwiZGF0ZSI6MTYzNDc1MDE2NCwiaWF0IjoxNjM0NzUwMTY0fQ.BuhlVAJATAPeQi-HQWEh0LwuXBoU4UpXk1XxWDILU38"
      );
    });

    test("should return empty string from a empty cookie string", () => {
      const result = parsePrismicAuthToken("");
      expect(result).toBe("");
    });

    test("should return empty string from a wrong formed cookie string", () => {
      const wrongCookieString =
        "SESSION=0a41c2a9944577c6000b5b1ffdbae884492641d6-T=_9T%27X0%2BIZM%3EPN8Y%3F7H44MRX8%3CD%5B%5EZ%2BW%27Q%2B+_G%3CSE7%5BAR6WS%3EB8%2BR%5C6V%2B%25D%29RGXSJ%3B&U=kevinj%40overlay-tech.com&I=09c00b56e4&C=19719956967e75293da8612c36d44427be2223f376e27bd9bbcf5080b072620e-1634750164799-1fdc0de28b3028b1196c2bfdfe6432242e6b8d0a05620980cc9405f6a8a5494648&D=1634725810; Path=/; SameSite=None; fake-auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC.eyJ0eXBlIjoidXNlciIsImlkIjoiNjBjMGUzNzIxMTAwMDAyMjAwZDQxMGExIiwiZGF0ZSI6MTYzNDc1MDE2NCwiaWF0IjoxNjM0NzUwMTY0fQ.BuhlVAJATAPeQi-HQWEh0LwuXBoU4UpXk1XxWDILU38";
      const result = parsePrismicAuthToken(wrongCookieString);
      expect(result).toBe("");
    });
  });

  describe("serializeCookies", () => {
    test("should create an cookie string with multiple cookies", () => {
      const cookies = [
        "SESSION=0a41c2a9944577c6000b5b1ffdbae884492641d;",
        "prismic-auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC.eyJ0eXBlIjoidXNlciIsImlkIjoiNjBjMGUzNzIxMTAwMDAyMjAwZDQxMGExIiwiZGF0ZSI6MTYzNDc1MDE2NCwiaWF0IjoxNjM0NzUwMTY0fQ.BuhlVAJATAPeQi-HQWEh0LwuXBoU4UpXk1XxWDILU38; Path=/; SameSite=None",
      ];
      const result = serializeCookies(cookies);
      expect(result).toBe(
        "SESSION=0a41c2a9944577c6000b5b1ffdbae884492641d; prismic-auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC.eyJ0eXBlIjoidXNlciIsImlkIjoiNjBjMGUzNzIxMTAwMDAyMjAwZDQxMGExIiwiZGF0ZSI6MTYzNDc1MDE2NCwiaWF0IjoxNjM0NzUwMTY0fQ.BuhlVAJATAPeQi-HQWEh0LwuXBoU4UpXk1XxWDILU38; Path=/; SameSite=None"
      );
    });
  });

  describe("serializeCookie", () => {
    test("should extract correctly cookie from a well formed cookie string", () => {
      const result = serializeCookie(
        "prismic-auth",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC.eyJ0eXBlIjoidXNlciIsImlkIjoiNjBjMGUzNzIxMTAwMDAyMjAwZDQxMGExIiwiZGF0ZSI6MTYzNDc1MDE2NCwiaWF0IjoxNjM0NzUwMTY0fQ.BuhlVAJATAPeQi-HQWEh0LwuXBoU4UpXk1XxWDILU38"
      );
      expect(result).toBe(
        "prismic-auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC.eyJ0eXBlIjoidXNlciIsImlkIjoiNjBjMGUzNzIxMTAwMDAyMjAwZDQxMGExIiwiZGF0ZSI6MTYzNDc1MDE2NCwiaWF0IjoxNjM0NzUwMTY0fQ.BuhlVAJATAPeQi-HQWEh0LwuXBoU4UpXk1XxWDILU38"
      );
    });
  });
});
