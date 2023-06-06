// @vitest-environment jsdom
import { describe, test, expect, vi } from "vitest";

import { render } from "../../../../test/__testutils__";
import Logo from "./Logo";
import { FrontEndEnvironment } from "@lib/models/common/Environment";

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
vi.mock("next/router", () => require("next-router-mock"));

describe("Navigation logo", () => {
  const container = render(<Logo />, {
    preloadedState: {
      environment: {
        manifest: {
          apiEndpoint: "https://foo.cdn.prismic.io/api/v2",
        },
      } as FrontEndEnvironment,
    },
  });

  test("should display the repo name and domain from the api endpoint and a link the repo", async () => {
    expect(await container.findByText("Foo")).toBeVisible();
    expect(await container.findByText("foo.prismic.io")).toBeVisible();
    expect(
      await container.findByTitle("open prismic repository")
    ).toHaveAttribute("href", "https://foo.prismic.io");
  });
});
