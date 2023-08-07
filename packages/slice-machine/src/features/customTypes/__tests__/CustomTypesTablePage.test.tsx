// @vitest-environment jsdom
import { describe, vi, test, TestContext } from "vitest";
import mockRouter from "next-router-mock";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";

import {
  CustomTypeFormat,
  createSliceMachineManager,
} from "@slicemachine/manager";
import { createSliceMachineManagerMSWHandler } from "@slicemachine/manager/test";
import { CustomTypeReadHookData } from "@slicemachine/plugin-kit";
import { CustomTypes } from "@lib/models/common/CustomType";
import { render, screen, waitFor, within } from "test/__testutils__";
import { createTestPlugin } from "test/__testutils__/createTestPlugin";
import { createTestProject } from "test/__testutils__/createTestProject";
import { CustomTypesTablePage } from "../customTypesTable/CustomTypesTablePage";
import { CUSTOM_TYPES_MESSAGES } from "../customTypesMessages";
import pkg from "../../../../package.json";

const formats = [
  {
    format: "custom",
  },
  {
    format: "page",
  },
];

describe.each(formats)(
  "CustomTypesTablePage > All formats > $format type",
  (args) => {
    const format = args.format as CustomTypeFormat;

    test(`should display the ${format} types table`, async (ctx) => {
      await renderCustomTypesTablePage({ format, ctx });

      // Check each custom type for the current format
      for (const customTypeMock of customTypesMockByFormat[format]) {
        // Scope the check for each row
        const row = screen
          .getByText(customTypeMock.id)
          .closest("tr") as HTMLElement;
        expect(within(row).getByText(customTypeMock.id)).toBeVisible();
        expect(
          within(row).getByText(customTypeMock.label as string)
        ).toBeVisible();
        expect(
          within(row).getByText(
            customTypeMock.repeatable ? "Reusable" : "Single"
          )
        ).toBeVisible();
      }

      // Check that there is the correct number of custom types displayed
      expect(screen.getAllByText(/MyID/)).toHaveLength(
        customTypesMockByFormat[format].length
      );
    });

    test(`should create a ${format} type from the table`, async (ctx) => {
      const { user } = await renderCustomTypesTablePage({ format, ctx });

      // Click on the create button
      await user.click(screen.getByText("Create"));

      // Ensure the modal is visible
      expect(
        await screen.findByText(`Create a new ${format} type`)
      ).toBeVisible();

      // Scope the test to the modal
      const form = screen
        .getByText(`Create a new ${format} type`)
        .closest("form") as HTMLElement;

      // Get form inputs
      const idInput = within(form).getByPlaceholderText(
        CUSTOM_TYPES_MESSAGES[format].inputPlaceholder
      );
      const nameInput = within(form).getByPlaceholderText(
        `A display name for the ${format} type`
      );

      // Fill the form
      const newCustomType = `MyNew${format}Type`;
      await user.type(idInput, newCustomType);
      await user.type(nameInput, `My new ${format} type`);

      // Submit the form
      await user.click(within(form).getByRole("button", { name: "Create" }));

      // Check that the new custom type is visible in the table
      expect(await screen.findByText(newCustomType)).toBeVisible();

      // Check that the redirection has been done
      expect(mockRouter.asPath).toEqual(`/${format}-types/${newCustomType}`);
    });

    test(`should delete a ${format} type from the table`, async (ctx) => {
      const { user } = await renderCustomTypesTablePage({ format, ctx });

      // Scope the test for the first row
      const row = screen
        .getByText(customTypesMockByFormat[format][0].id)
        .closest("tr") as HTMLElement;

      // Click on the table row settings button
      await user.click(within(row).getByTestId("editDropdown"));

      // Click on the remove button
      await user.click(await screen.findByText("Remove"));

      // Ensure the modal is visible
      expect(await screen.findByText(`Delete ${format} type`)).toBeVisible();

      // Confirm the deletion
      await user.click(screen.getByRole("button", { name: "Delete" }));

      // Check that the custom type is not visible
      await waitFor(() => {
        expect(
          screen.queryByText(customTypesMockByFormat[format][0].id)
        ).not.toBeInTheDocument();
      });
    });

    test(`should rename a ${format} type from the table`, async (ctx) => {
      const { user } = await renderCustomTypesTablePage({ format, ctx });

      // Scope the test for the first row
      const row = screen
        .getByText(customTypesMockByFormat[format][0].id)
        .closest("tr") as HTMLElement;

      // Click on the table row settings button
      await user.click(within(row).getByTestId("editDropdown"));

      // Click on the rename button
      await user.click(await screen.findByText("Rename"));

      // Ensure the modal is visible
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
          screen.queryByText(customTypesMockByFormat[format][0].label as string)
        ).not.toBeInTheDocument();
      });

      // Check that the renamed custom type is visible
      expect(screen.getByText(renamedCustomType)).toBeVisible();
    });

    test(`should access a ${format} type page builder from the table`, async (ctx) => {
      const { user } = await renderCustomTypesTablePage({ format, ctx });

      // Click on the table row
      await user.click(screen.getByText(customTypesMockByFormat[format][0].id));

      // Check that the redirection has been done
      expect(mockRouter.asPath).toEqual(
        `/${format}-types/${customTypesMockByFormat[format][0].id}`
      );
    });
  }
);

describe("CustomTypesTablePage > Custom type", () => {
  test("should convert a custom type to page type from the table", async (ctx) => {
    const format = "custom";
    const { user, rerender } = await renderCustomTypesTablePage({
      format,
      ctx,
    });

    // Scope the test for the first row
    const row = screen
      .getByText(customTypesMockByFormat[format][0].id)
      .closest("tr") as HTMLElement;

    // Click on the table row settings button
    await user.click(within(row).getByTestId("editDropdown"));

    // Click on the convert to page type button
    await user.click(await screen.findByText("Convert to page type"));

    // Check that the custom type is not visible anymore
    await waitFor(() => {
      expect(
        screen.queryByText(customTypesMockByFormat[format][0].label as string)
      ).not.toBeInTheDocument();
    });

    // Check that the converted custom type is visible on the page type table now
    rerender(<CustomTypesTablePage format="page" />);
    expect(
      screen.getByText(customTypesMockByFormat[format][0].id)
    ).toBeVisible();
  });
});

function createCustomTypesMock(
  format: CustomTypeFormat,
  count: number
): CustomType[] {
  return Array.from(Array(count), (_, index) => ({
    id: `MyID${format}${index}`,
    label: `My ${format} ${index}`,
    repeatable: !!(index % 2),
    format,
    status: true,
    json: {},
  }));
}

type CustomTypesMockByFormat = {
  custom: CustomType[];
  page: CustomType[];
};

const customTypesMockByFormat: CustomTypesMockByFormat = {
  custom: createCustomTypesMock("custom", 10),
  page: createCustomTypesMock("page", 10),
};

const customTypesMock = [
  ...customTypesMockByFormat["custom"],
  ...customTypesMockByFormat["page"],
];

type RenderCustomTypesTablePageArgs = {
  format: CustomTypeFormat;
  ctx: TestContext;
};

async function renderCustomTypesTablePage({
  format,
  ctx,
}: RenderCustomTypesTablePageArgs) {
  vi.mock("next/router", () => import("next-router-mock"));

  const adapter = createTestPlugin({
    setup: ({ hook }) => {
      hook("custom-type:create", () => void 0);
      hook("custom-type:update", () => void 0);
      hook("custom-type:rename", () => void 0);
      hook("custom-type:delete", () => void 0);
      hook("custom-type-library:read", () => {
        return { ids: customTypesMock.map((customType) => customType.id) };
      });
      hook("custom-type:read", (args: CustomTypeReadHookData) => {
        const model = customTypesMock.find(
          (customTypeMock) => customTypeMock.id === args.id
        );

        if (model) {
          return { model: model };
        }

        throw new Error("not implemented");
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
      availableCustomTypes: {
        ...customTypesMockByFormat.custom.reduce(
          (obj, item) => ({
            ...obj,
            [item.id]: { local: CustomTypes.toSM(item) },
          }),
          {}
        ),
        ...customTypesMockByFormat.page.reduce(
          (obj, item) => ({
            ...obj,
            [item.id]: { local: CustomTypes.toSM(item) },
          }),
          {}
        ),
      },
      environment: {
        manifest: { apiEndpoint: "https://foo.cdn.prismic.io/api/v2" },
      },
      slices: { libraries: [], remoteSlices: [] },
    },
  };

  const renderResults = render(
    <CustomTypesTablePage format={format} />,
    // @ts-expect-error TS2345: Argument of type '{ preloadedState: { availableCustomTypes: {}; environment: { manifest: { apiEndpoint: string; }; }; slices: { libraries: never[]; remoteSlices: never[]; }; }; }' is not assignable to parameter of type 'Partial<{ preloadedState: Partial<SliceMachineStoreType>; store: Store<SliceMachineStoreType, AnyAction>; } & RenderOptions<...>>'.
    customTypeMockStore
  );

  // Ensure table finished loading
  expect(
    await screen.findByText(customTypesMockByFormat[format][0].id)
  ).toBeVisible();

  return renderResults;
}
