// @vitest-environment jsdom
import { describe, test, expect, vi } from "vitest";

import { render, screen } from "../../../test/__testutils__";
import { BaseHoverCard } from "./BaseHoverCard";

vi.mock("next/router", () => import("next-router-mock"));

describe("BaseHoverCard", () => {
  test("Should open when hovering trigger", async () => {
    const { user } = render(
      <BaseHoverCard trigger={<button>Hello</button>}>
        <div>hover content</div>
      </BaseHoverCard>
    );

    expect(screen.queryByText("hover content")).not.toBeInTheDocument();

    const button = screen.getByText("Hello");
    await user.hover(button);

    expect(await screen.findByText("hover content")).toBeVisible();
  });
});
