import { Manifest } from "../../src/models";
import { fold, isRight, isLeft, getOrElseW } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/function";

describe("Manifest", () => {
  test("apiEnpoint: https://test.prismic.io/api/v2", () => {
    const input = {
      apiEndpoint: "https://test.prismic.io/api/v2",
      framework: "none",
    };
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
    expect(decoded?.framework).toEqual(input.framework);
  });

  test("apiEnpoint: https://test.wroom.io/api/v2", () => {
    const input = {
      apiEndpoint: "https://test.wroom.io/api/v2",
      framework: "next",
    };
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

  test("apiEnpoint: https://wroom.io/api/v2", () => {
    const input = {
      apiEndpoint: "https://wroom.io/api/v2",
      framework: "nuxt",
    };
    const result = Manifest.decode(input);
    expect(isLeft(result)).toBeTruthy();
  });

  test("apiEnpoint: https://test.prismic.test/api/v2", () => {
    const input = {
      apiEndpoint: "https://test.prismic.test/api/v2",
      framework: "react",
    };
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
    const input = {
      apiEndpoint: "https://test.prismic.io",
      framework: "vue",
    };
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
    const input = { framework: "none" };
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

  test("apiEnpoint: https://foo-bar.cdn.prismic.io/api/v2", () => {
    const input = {
      apiEndpoint: "https://foo-bar.cdn.prismic.io/api/v2",
      framework: "none",
    };
    const result = Manifest.decode(input);
    expect(isRight(result)).toBeTruthy();
    const decoded = pipe(
      result,
      fold(
        (e) => {
          console.log(e);
          return null;
        },
        (d: Manifest) => d
      )
    );
    expect(decoded?.apiEndpoint).toEqual(input.apiEndpoint);
  });

  test("framework: not supported", () => {
    const input = {
      apiEndpoint: "https://foo-bar.cdn.prismic.io/api/v2",
      framework: "foo",
    };

    const result = Manifest.decode(input);
    expect(isLeft(result)).toBeTruthy();

    const errorFn = jest.fn();

    getOrElseW(errorFn)(result);

    expect(errorFn).toHaveBeenCalled();
  });
});
