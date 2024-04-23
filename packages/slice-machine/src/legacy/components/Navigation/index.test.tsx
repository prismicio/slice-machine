// @vitest-environment jsdom
import { cache } from "@prismicio/editor-support/Suspense";
import { createSliceMachineManager } from "@slicemachine/manager";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";
import Router from "next/router";
import { act } from "react-dom/test-utils";
import { describe, expect, test, vi } from "vitest";

import {
  render,
  type RenderReturnType,
  screen,
  waitFor,
  within,
} from "@/../test/__testutils__";
import { createTestPlugin } from "@/../test/__testutils__/createTestPlugin";
import { createTestProject } from "@/../test/__testutils__/createTestProject";
import { FrontEndEnvironment } from "@/legacy/lib/models/common/Environment";
import { AuthStatus, UserContextStoreType } from "@/modules/userContext/types";

import SideNavigation from "./index";

const mockRouter = vi.mocked(Router);

vi.mock("next/router", () => import("next-router-mock"));

type renderSideNavigationArgs = {
  hasChanges?: boolean;
  authStatus?: AuthStatus;
};

function renderSideNavigation(
  args: renderSideNavigationArgs = {},
): RenderReturnType {
  const { hasChanges = false, authStatus = AuthStatus.AUTHORIZED } = args;

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
    renderSideNavigation();
    expect(await screen.findByText("foo")).toBeVisible();
    expect(await screen.findByText("foo.prismic.io")).toBeVisible();
    const link = screen.getByTestId("prismic-repository-link");
    expect(link).toHaveAttribute("href", "https://foo.prismic.io");
    expect(link).toHaveAttribute("target", "_blank");
  });

  test.skip.each([
    ["Page types", "/"],
    ["Custom types", "/custom-types"],
    ["Slices", "/slices"],
    ["Changelog", "/changelog"],
    // TODO: once we have a plan fo how to display individual libraries change this
    // ["Slices/a", "/slices#slices/a"],
    // ["Slices/b", "/slices#slices/b"]
  ])(
    "internal navigation links: when clicking title %s it should navigate to %s",
    async (title, path) => {
      const { user } = renderSideNavigation();

      await act(() => mockRouter.push("/"));

      const link = screen.getByText(title).parentElement
        ?.parentElement as HTMLElement;

      expect(link).toHaveAttribute("href", path);

      await user.click(link);

      expect(mockRouter.asPath).toBe(path);
    },
  );

  test("should display the number of changes on the 'Review changes' item", async () => {
    renderSideNavigation({ hasChanges: true });

    expect(await screen.findByText("Review changes")).toBeVisible();
    const changesItem = screen
      .getByText("Review changes")
      .closest("button") as HTMLButtonElement;

    expect(within(changesItem).getByText("1")).toBeVisible();
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
      }),
    );

    renderSideNavigation();

    const link = (await screen.findByText("Learn Prismic")).parentElement
      ?.parentElement as HTMLElement;

    await waitFor(() =>
      expect(link).toHaveAttribute(
        "href",
        "https://prismic.io/academy/prismic-and-nextjs",
      ),
    );

    expect(link).toHaveAttribute("target", "_blank");
  });

  test("Video Item not next", async () => {
    renderSideNavigation();

    const link = (await screen.findByText("Learn Prismic")).parentElement
      ?.parentElement as HTMLElement;
    expect(link).toHaveAttribute(
      "href",
      "https://youtube.com/playlist?list=PLUVZjQltoA3wnaQudcqQ3qdZNZ6hyfyhH",
    );
    expect(link).toHaveAttribute("target", "_blank");
  });
});
