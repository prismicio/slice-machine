// @vitest-environment jsdom
import { describe, test, expect, vi } from "vitest";
import {
  render,
  within,
  screen,
  type RenderReturnType,
  waitFor,
} from "../../../test/__testutils__";
import SideNavigation from "./index";
import { FrontEndEnvironment } from "@lib/models/common/Environment";
import { UserContextStoreType } from "@src/modules/userContext/types";
import { act } from "react-dom/test-utils";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";

import Router from "next/router";
import { createTestPlugin } from "test/__testutils__/createTestPlugin";
import { createTestProject } from "test/__testutils__/createTestProject";
import { createSliceMachineManager } from "@slicemachine/manager";
import { cache } from "@prismicio/editor-support/Suspense";

const mockRouter = vi.mocked(Router);

vi.mock("next/router", () => import("next-router-mock"));

function renderApp({ canUpdate }: { canUpdate: boolean }): RenderReturnType {
  return render(<SideNavigation />, {
    preloadedState: {
      availableCustomTypes: {},
      slices: {
        libraries: [
          {
            name: "slices/a",
            path: "slices/a",
            components: [],
            isLocal: true,
            meta: {
              isNodeModule: false,
              isDownloaded: false,
              isManual: true,
            },
          },
          {
            name: "slices/b",
            path: "slices/b",
            components: [],
            isLocal: true,
            meta: {
              isNodeModule: false,
              isDownloaded: false,
              isManual: true,
            },
          },
        ],
        remoteSlices: [],
      },
      environment: {
        repo: "foo",
        manifest: {
          apiEndpoint: "https://foo.cdn.prismic.io/api/v2",
        },
        changelog: {
          currentVersion: "",
          updateAvailable: canUpdate,
          latestNonBreakingVersion: null,
          versions: [],
        },
      } as unknown as FrontEndEnvironment,
      userContext: {
        hasSeenTutorialsToolTip: false,
      } as unknown as UserContextStoreType,
    },
  });
}

describe("Side Navigation", () => {
  beforeEach(() => {
    cache.clear();
  });

  test("Logo and repo area", async () => {
    renderApp({ canUpdate: true });
    expect(await screen.findByText("foo")).toBeVisible();
    expect(await screen.findByText("foo.prismic.io")).toBeVisible();
    const link = await screen.findByTitle("Open prismic repository");
    expect(link).toHaveAttribute("href", "https://foo.prismic.io");
    expect(link).toHaveAttribute("target", "_blank");
  });

  test("Update box when update is available", async () => {
    renderApp({ canUpdate: true });
    expect(await screen.findByText("Updates Available")).toBeVisible();
  });

  test("Update box when there are no updates", async () => {
    renderApp({ canUpdate: false });
    const element = await act(() => screen.queryByText("Updates Available"));
    expect(element).toBeNull();
  });

  test.each([
    ["Page types", "/"],
    ["Custom types", "/custom-types"],
    ["Changes", "/changes"],

    ["Changelog", "/changelog"],
    ["Slices", "/slices"],
    // TODO: once we have a plan fo how to display individual libraries change this
    // ["Slices/a", "/slices#slices/a"],
    // ["Slices/b", "/slices#slices/b"]
  ])(
    "internal navigation links: when clicking title %s it should navigate to %s",
    async (title, path) => {
      const { user } = renderApp({ canUpdate: true });

      await act(() => mockRouter.push("/"));

      const link = screen.getByText(title).parentElement
        ?.parentElement as HTMLElement;

      expect(link).toHaveAttribute("href", path);

      await user.click(link);

      expect(mockRouter.asPath).toBe(path);
    }
  );

  test("Video Item with next", async (ctx) => {
    const adapter = createTestPlugin({
      meta: {
        name: "@slicemachine/adapter-next",
      },
    });
    const cwd = await createTestProject({
      adapter,
    });
    const manager = createSliceMachineManager({
      nativePlugins: { [adapter.meta.name]: adapter },
      cwd,
    });

    await manager.plugins.initPlugins();

    ctx.msw.use(
      createSliceMachineManagerMSWHandler({
        url: "http://localhost:3000/_manager",
        sliceMachineManager: manager,
      })
    );

    renderApp({ canUpdate: true });

    const link = (await screen.findByText("Tutorial")).parentElement
      ?.parentElement as HTMLElement;

    await waitFor(() =>
      expect(link).toHaveAttribute(
        "href",
        "https://prismic.io/academy/prismic-and-nextjs"
      )
    );

    expect(link).toHaveAttribute("target", "_blank");
  });

  test("Video Item not next", async () => {
    const { user } = renderApp({ canUpdate: true });

    const link = (await screen.findByText("Tutorial")).parentElement
      ?.parentElement as HTMLElement;
    expect(link).toHaveAttribute(
      "href",
      "https://youtube.com/playlist?list=PLUVZjQltoA3wnaQudcqQ3qdZNZ6hyfyhH"
    );
    expect(link).toHaveAttribute("target", "_blank");

    await user.hover(link);

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toBeVisible();
    const closeButton = await within(tooltip).findByTestId(
      "video-tooltip-close-button"
    );
    await user.click(closeButton);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
