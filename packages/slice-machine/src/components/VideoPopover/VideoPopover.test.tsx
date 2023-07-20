// @vitest-environment jsdom
import React from "react";
import { describe, test, expect, vi } from "vitest";
import { screen, render, waitFor } from "../../../test/__testutils__"; // skip usinng this

import { VideoPopover } from ".";

// TBD: it's odd that this needs to be included in this test
vi.mock("next/router", () => import("next-router-mock"));

describe("VideoPopover", () => {
  test("when open is set to false it should not display", async () => {
    const onClose = vi.fn();
    const onPlay = vi.fn();
    const App = () => {
      return (
        <VideoPopover
          cloudName="dmtf1daqp"
          publicId="Tooltips/pa-course-overview_eaopsn"
          open={false}
          onClose={onClose}
          onPlay={onPlay}
        >
          <div>Thing</div>
        </VideoPopover>
      );
    };

    const { user } = render(<App />);

    const target = screen.getByText("Thing");

    await user.hover(target);

    const tip = screen.queryByText("Got it");

    expect(tip).not.toBeInTheDocument();
  });

  test("given open=true it will open by default and act like a tooltip", async () => {
    const onClose = vi.fn();
    const onPlay = vi.fn();

    const App = () => {
      return (
        <VideoPopover
          open={true}
          onClose={onClose}
          onPlay={onPlay}
          delay={0}
          cloudName="dmtf1daqp"
          publicId="Tooltips/pa-course-overview_eaopsn"
        >
          <div>Thing</div>
        </VideoPopover>
      );
    };

    const { user } = render(<App />);

    const button = await waitFor(() => screen.getByText("Got it"));

    expect(button).toBeInTheDocument();

    await waitFor(() => user.click(button));

    expect(screen.queryByText("Got it")).not.toBeInTheDocument();

    expect(onClose).toHaveBeenCalled();
  });

  test("give it is open, it should close when a user clicks else where on the screen", async () => {
    const onClose = vi.fn();
    const onPlay = vi.fn();

    const App = () => {
      return (
        <div>
          <VideoPopover
            open={true}
            onClose={onClose}
            onPlay={onPlay}
            delay={0}
            cloudName="dmtf1daqp"
            publicId="Tooltips/pa-course-overview_eaopsn"
          >
            <div>Thing</div>
          </VideoPopover>

          <button>other</button>
        </div>
      );
    };

    const { user } = render(<App />);

    await waitFor(() => screen.getByText("Got it"));

    const otherButton = screen.getByText("other");

    await user.click(otherButton);

    expect(screen.queryByText("Got it")).not.toBeInTheDocument();
  });

  test("hovering in and out should not close the popover", async () => {
    const onClose = vi.fn();
    const onPlay = vi.fn();

    const App = () => {
      return (
        <div>
          <VideoPopover
            open={true}
            onClose={onClose}
            onPlay={onPlay}
            delay={0}
            cloudName="dmtf1daqp"
            publicId="Tooltips/pa-course-overview_eaopsn"
          >
            <div>Thing</div>
          </VideoPopover>

          <button>other</button>
        </div>
      );
    };

    const { user } = render(<App />);

    const closeButton = await screen.findByText("Got it");

    const otherButton = screen.getByText("other");

    await user.hover(closeButton);

    await user.hover(otherButton);

    expect(screen.queryByText("Got it")).toBeInTheDocument();
  });
});
