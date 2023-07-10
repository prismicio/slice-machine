// @vitest-environment jsdom
import { describe, vitest, vi, TestContext } from "vitest";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";

import {
  CustomTypeFormat,
  createSliceMachineManager,
} from "@slicemachine/manager";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";
import { CustomTypes } from "@lib/models/common/CustomType";
import { render, screen, waitFor, within } from "test/__testutils__";
import { createTestPlugin } from "test/__testutils__/createTestPlugin";
import { createTestProject } from "test/__testutils__/createTestProject";
import { CustomTypesBuilderPageWithProvider } from "../customTypesBuilder/CustomTypesBuilderPage";
import pkg from "../../../../package.json";

const formats = [
  {
    format: "custom",
  },
  {
    format: "page",
  },
];

import Router from "next/router"
const mockRouter = vi.mocked(Router);
vi.mock("next/router", () => import("next-router-mock"));

describe.skip.each(formats)(
  "CustomTypeBuilderPage > All formats > $format type",
  (args) => {
    const format = args.format as CustomTypeFormat;

    test(`should delete a ${format} type from the dropdown`, async (ctx) => {
      const { user } = await renderCustomTypesBuilderPage({ ctx });

      await user.click(screen.getByTestId("editDropdown"));
      await user.click(await screen.findByText("Remove"));
      expect(await screen.findByText(`Delete ${format} type`)).toBeVisible();
      await user.click(screen.getByRole("button", { name: "Delete" }));

      await waitFor(() => {
        expect(
          screen.queryByText(customTypesMocks[format === "custom" ? 0 : 1].id)
        ).not.toBeInTheDocument();
      });
    });
    test(`should rename a ${format} type from the dropdown`, async (ctx) => {
      const { user } = await renderCustomTypesBuilderPage({ ctx });

      await user.click(screen.getByTestId("editDropdown"));
      await user.click(await screen.findByText("Rename"));
      expect(await screen.findByText(`Rename a ${format} type`)).toBeVisible();

      // Scope the test to the modal
      const form = screen
        .getByText(`Rename a ${format} type`)
        .closest("form") as HTMLElement;

      // Get form input
      const renamedCustomType = `My renamed ${format} type`;
      const nameInput = within(form).getByPlaceholderText(
        `A display name for the ${format} type`
      );

      // Clear the name and type a new one
      await user.clear(nameInput);
      await user.type(nameInput, renamedCustomType);

      // Submit the form
      await user.click(screen.getByRole("button", { name: "Rename" }));

      // Check that the old custom type label is not visible anymore
      await waitFor(() => {
        expect(
          screen.queryByText(customTypesMocks[format === "custom" ? 0 : 1].id)
        ).not.toBeInTheDocument();
      });

      // Check that the renamed custom type is visible
      expect(screen.getByText(renamedCustomType)).toBeVisible();
    });
  }
);

describe("CustomTypesBuilderPage > Custom type", () => {
  test("should convert a custom type to page type from the dropdown", async (ctx) => {
    const customType = customTypesMocks[0]
    const { user } = await renderCustomTypesBuilderPage({ ctx, customType });

    // Click on the table row settings button
    await user.click(screen.getByTestId("editDropdown"));

    // Click on the convert to page type button
    await user.click(await screen.findByText("Convert to page type"));

    await waitFor(() =>
      expect(screen.getByText("Page types /")).toBeVisible()
    )

    // expect(mockRouter.asPath).toEqual(`/page-types/${customType.id}`);

    // expect(screen.getByText("Page types /")).toBeVisible();
  });
});

function createCustomTypeMock(format: CustomTypeFormat): CustomType {
  return {
    id: `MyID${format}`,
    label: `My ${format}`,
    repeatable: false,
    format,
    status: true,
    json: {},
  };
}

const customTypesMocks = [
  createCustomTypeMock("custom"),
  createCustomTypeMock("page"),
];

type RenderCustomTypesBuilderPageArgs = {
  ctx: TestContext;
  customType: CustomType;
};

async function renderCustomTypesBuilderPage({
  ctx,
  customType
}: RenderCustomTypesBuilderPageArgs) {

  const adapter = createTestPlugin({
    setup: ({ hook }) => {
      hook("custom-type:create", () => void 0);
      hook("custom-type:update", () => void 0);
      hook("custom-type:rename", () => void 0);
      hook("custom-type:delete", () => void 0);
      hook("custom-type-library:read", () => {
        return { ids: customTypesMocks.map((customType) => customType.id) };
      });
      hook("custom-type:read", () => {
        return { model: customType }
      });
    },
  });
  const cwd = await createTestProject({
    adapter,
  });
  const manager = createSliceMachineManager({
    nativePlugins: { [adapter.meta.name]: adapter },
    cwd,
  });

  await manager.telemetry.initTelemetry({
    appName: pkg.name,
    appVersion: pkg.version,
  });
  await manager.plugins.initPlugins();

  ctx.msw.use(
    createSliceMachineManagerMSWHandler({
      url: "http://localhost:3000/_manager",
      sliceMachineManager: manager,
    })
  );


  const customTypeMockStore = {
    preloadedState: {
      availableCustomTypes: customTypesMocks.reduce(
        (obj, item) => ({
          ...obj,
          [item.id]: { local: CustomTypes.toSM(item) },
        }),
        {}
      ),
    },
  };

  const renderResults = render(
    <CustomTypesBuilderPageWithProvider customType={CustomTypes.toSM(customType)} remoteCustomType={undefined} />,
    customTypeMockStore
  );

  const preText = customType.format === "page" ? "Page types / " : "Custom types / ";
  expect(
    await screen.findByText(preText + (customType.label as string))
  ).toBeVisible();

  return renderResults;
}
