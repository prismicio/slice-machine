import { Manifest } from "../../src/models";
import { fold, isRight, isLeft } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/function";

describe("Manifest", () => {
  test("apiEnpoint: https://test.prismic.io/api/v2", () => {
    const input = { apiEndpoint: "https://test.prismic.io/api/v2" };
    const result = Manifest.decode(input);
    expect(isRight(result)).toBeTruthy();
    const decoded = pipe(
      result,
      fold(
        () => null,
        (d: Manifest) => d
      )
    );
    expect(decoded?.apiEndpoint).toEqual(input.apiEndpoint);
  });

  test("apiEnpoint: https://test.wroom.io/api/v2", () => {
    const input = { apiEndpoint: "https://test.wroom.io/api/v2" };
    const result = Manifest.decode(input);
    expect(isRight(result)).toBeTruthy();
    const decoded = pipe(
      result,
      fold(
        () => null,
        (d: Manifest) => d
      )
    );
    expect(decoded?.apiEndpoint).toEqual(input.apiEndpoint);
  });

  test("apiEnpoint: https://test.wroom.test/api/v2", () => {
    const input = { apiEndpoint: "https://test.wroom.test/api/v2" };
    const result = Manifest.decode(input);
    expect(isRight(result)).toBeTruthy();
    const decoded = pipe(
      result,
      fold(
        () => null,
        (d: Manifest) => d
      )
    );
    expect(decoded?.apiEndpoint).toEqual(input.apiEndpoint);
  });

  test("apiEnpoint: https://test.prismic.test/api/v2", () => {
    const input = { apiEndpoint: "https://test.prismic.test/api/v2" };
    const result = Manifest.decode(input);
    expect(isLeft(result)).toBeTruthy();
    const decoded = pipe(
      result,
      fold(
        () => null,
        (d: Manifest) => d
      )
    );
    expect(decoded).toBeNull();
  });

  test("apiEnpoint: https://test.prismic.io", () => {
    const input = { apiEndpoint: "https://test.prismic.test" };
    const result = Manifest.decode(input);
    expect(isLeft(result)).toBeTruthy();
    const decoded = pipe(
      result,
      fold(
        () => null,
        (d: Manifest) => d
      )
    );
    expect(decoded).toBeNull();
  });

  test("apiEnpoint: undefined", () => {
    const input = {};
    const result = Manifest.decode(input);
    expect(isLeft(result)).toBeTruthy();
    const decoded = pipe(
      result,
      fold(
        () => null,
        (d: Manifest) => d
      )
    );
    expect(decoded).toBeNull();
  });
});
