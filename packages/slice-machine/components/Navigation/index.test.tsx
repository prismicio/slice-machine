// @vitest-environment jsdom
import { describe, test, expect, vi } from "vitest";
import Router from "next/router";
import { act } from "react-dom/test-utils";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";
import { createSliceMachineManager } from "@slicemachine/manager";

import { FrontEndEnvironment } from "@lib/models/common/Environment";
import { UserContextStoreType } from "@src/modules/userContext/types";
import { AuthStatus } from "@src/modules/userContext/types";
import { createTestPlugin } from "test/__testutils__/createTestPlugin";
import { createTestProject } from "test/__testutils__/createTestProject";
import {
  render,
  within,
  screen,
  type RenderReturnType,
  waitFor,
} from "test/__testutils__";
import SideNavigation from "./index";
import { cache } from "@prismicio/editor-support/Suspense";

const mockRouter = vi.mocked(Router);

vi.mock("next/router", () => import("next-router-mock"));

type renderSideNavigationArgs = {
  canUpdate: boolean;
  hasChanges?: boolean;
  authStatus?: AuthStatus;
};

function renderSideNavigation({
  canUpdate,
  hasChanges = false,
  authStatus = AuthStatus.AUTHORIZED,
}: renderSideNavigationArgs): RenderReturnType {
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
        remoteSlices: hasChanges
          ? [
              {
                name: "slices/a",
                id: "a",
                type: "SharedSlice",
                variations: [],
                description: "",
              },
            ]
          : [],
      },
      environment: {
        repo: "foo",
        manifest: {
          apiEndpoint: "https://foo.cdn.prismic.io/api/v2",
        },
        changelog: {
          sliceMachine: {
            currentVersion: "",
            updateAvailable: canUpdate,
            latestNonBreakingVersion: null,
            versions: [],
          },
          adapter: {
            name: "",
            updateAvailable: canUpdate,
            versions: [],
          },
        },
      } as unknown as FrontEndEnvironment,
      userContext: {
        hasSeenTutorialsToolTip: false,
        authStatus: authStatus,
      } as unknown as UserContextStoreType,
    },
  });
}

describe("Side Navigation", () => {
  beforeEach(() => {
    cache.clearAll();
    localStorage.clear();
  });

  test("Logo and repo area", async () => {
    renderSideNavigation({ canUpdate: true });
    expect(await screen.findByText("foo")).toBeVisible();
    expect(await screen.findByText("foo.prismic.io")).toBeVisible();
    const link = await screen.findByTitle("Open prismic repository");
    expect(link).toHaveAttribute("href", "https://foo.prismic.io");
    expect(link).toHaveAttribute("target", "_blank");
  });

  test("Update box when update is available", async () => {
    renderSideNavigation({ canUpdate: true });
    expect(await screen.findByText("Updates Available")).toBeVisible();
  });

  test("Update box when there are no updates", async () => {
    renderSideNavigation({ canUpdate: false });
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
      const { user } = renderSideNavigation({ canUpdate: true });

      await act(() => mockRouter.push("/"));

      const link = screen.getByText(title).parentElement
        ?.parentElement as HTMLElement;

      expect(link).toHaveAttribute("href", path);

      await user.click(link);

      expect(mockRouter.asPath).toBe(path);
    }
  );

  test("should display the number of changes on the 'Changes' item", async () => {
    renderSideNavigation({ canUpdate: true, hasChanges: true });

    expect(await screen.findByText("Changes")).toBeVisible();
    const changesItem = screen
      .getByText("Changes")
      .closest("a") as HTMLAnchorElement;

    expect(within(changesItem).getByText("1")).toBeVisible();
  });

  test("should not display the number of changes or 'Disconnect' on the 'Changes' item", async () => {
    renderSideNavigation({ canUpdate: true, hasChanges: false });

    expect(await screen.findByText("Changes")).toBeVisible();
    const changesItem = screen
      .getByText("Changes")
      .closest("a") as HTMLAnchorElement;

    expect(within(changesItem).queryByText("1")).not.toBeInTheDocument();
    expect(
      within(changesItem).queryByText("Logged out")
    ).not.toBeInTheDocument();
  });

  test("should display the information that user is disconnected on the 'Changes' item when unauthorized", async () => {
    renderSideNavigation({
      canUpdate: true,
      hasChanges: true,
      authStatus: AuthStatus.UNAUTHORIZED,
    });

    expect(await screen.findByText("Changes")).toBeVisible();
    const changesItem = screen
      .getByText("Changes")
      .closest("a") as HTMLAnchorElement;

    expect(within(changesItem).getByText("Logged out")).toBeVisible();
  });

  test("should display the information that user is disconnected on the 'Changes' item when forbidden", async () => {
    renderSideNavigation({
      canUpdate: true,
      hasChanges: true,
      authStatus: AuthStatus.FORBIDDEN,
    });

    expect(await screen.findByText("Changes")).toBeVisible();
    const changesItem = screen
      .getByText("Changes")
      .closest("a") as HTMLAnchorElement;

    expect(within(changesItem).getByText("Logged out")).toBeVisible();
  });

  test("should display the information that user is disconnected on the 'Changes' item when offline", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValueOnce(false);

    renderSideNavigation({
      canUpdate: true,
      hasChanges: true,
    });

    expect(await screen.findByText("Changes")).toBeVisible();
    const changesItem = screen
      .getByText("Changes")
      .closest("a") as HTMLAnchorElement;

    expect(within(changesItem).getByText("Logged out")).toBeVisible();
  });

  test("should not display the information that user is disconnected when user is online", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValueOnce(true);

    renderSideNavigation({
      canUpdate: true,
      hasChanges: true,
    });

    expect(await screen.findByText("Changes")).toBeVisible();
    const changesItem = screen
      .getByText("Changes")
      .closest("a") as HTMLAnchorElement;

    expect(
      within(changesItem).queryByText("Logged out")
    ).not.toBeInTheDocument();
  });

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

    renderSideNavigation({ canUpdate: true });

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
    const { user } = renderSideNavigation({ canUpdate: true });

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
