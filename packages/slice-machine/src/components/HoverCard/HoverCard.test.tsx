// @vitest-environment jsdom
import React from "react";
import { describe, test, expect, vi } from "vitest";

import { screen, render, waitFor } from "../../../test/__testutils__";
import { HoverCard, HoverCardCloseButton } from ".";

vi.mock("next/router", () => import("next-router-mock"));

describe("HoverCard", () => {
  test("when open is set to false it should not display", async () => {
    const onClose = vi.fn();

    const App = () => {
      return (
        <HoverCard
          open={false}
          onClose={onClose}
          trigger={<button>Trigger</button>}
        >
          <div>Content</div>
        </HoverCard>
      );
    };

    const { user } = render(<App />);

    const target = screen.getByText("Trigger");

    await user.hover(target);

    const tip = screen.queryByText("Content");

    expect(tip).not.toBeInTheDocument();
  });

  test("given open=true it will open by default and act like a tooltip", async () => {
    const onClose = vi.fn();

    const App = () => {
      return (
        <HoverCard
          open={true}
          onClose={onClose}
          openDelay={0}
          trigger={<button>Trigger</button>}
        >
          <HoverCardCloseButton>Got it</HoverCardCloseButton>
        </HoverCard>
      );
    };

    const { user } = render(<App />);

    const button = await waitFor(() => screen.getByText("Got it"));

    expect(button).toBeInTheDocument();

    await waitFor(() => user.click(button));

    expect(screen.queryByText("Content")).not.toBeInTheDocument();

    expect(onClose).toHaveBeenCalled();
  });

  test("give it is open, it should not close when a user clicks else where on the screen", async () => {
    const onClose = vi.fn();

    const App = () => {
      return (
        <div>
          <HoverCard
            open={true}
            onClose={onClose}
            openDelay={0}
            trigger={<button>Trigger</button>}
          >
            <div>Content</div>
          </HoverCard>

          <button>other</button>
        </div>
      );
    };

    const { user } = render(<App />);

    await waitFor(() => screen.getByText("Content"));

    const otherButton = screen.getByText("other");

    await user.click(otherButton);

    expect(screen.queryByText("Content")).toBeVisible();
  });

  test("hovering in and out should not close the HoverCard", async () => {
    const onClose = vi.fn();

    const App = () => {
      return (
        <div>
          <HoverCard
            open={true}
            onClose={onClose}
            openDelay={0}
            trigger={<button>Trigger</button>}
          >
            <div>Content</div>
          </HoverCard>

          <button>other</button>
        </div>
      );
    };

    const { user } = render(<App />);

    const closeButton = await screen.findByText("Content");

    const otherButton = screen.getByText("other");

    await user.hover(closeButton);

    await user.hover(otherButton);

    expect(screen.queryByText("Content")).toBeInTheDocument();
  });
});
