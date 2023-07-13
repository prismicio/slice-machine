// @vitest-environment jsdom
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "../../../test/__testutils__";
import { HoverCard } from "./HoverCard";

// TBD: it's odd that this needs to be included in this test
vi.mock("next/router", () => import("next-router-mock"));

describe("HoverCard", () => {
  test("Should open when anchor is moused over", async () => {
    const { user } = render(
      <HoverCard anchor={<button>Hello</button>}>
        <div>hover content</div>
      </HoverCard>
    );

    expect(screen.queryByText("hover content")).not.toBeInTheDocument();

    const button = screen.getByText("Hello");
    await user.hover(button);

    expect(await screen.findByText("hover content")).toBeVisible();
  });
});
