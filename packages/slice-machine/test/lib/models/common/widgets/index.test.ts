import { describe, test, expect } from "vitest";
import * as Widgets from "@lib/models/common/widgets";
import { CustomTypes, CustomTypeSM } from "@lib/models/common/CustomType";
import type { UID } from "@prismicio/types-internal/lib/customtypes/widgets";
import type { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import type { CustomType } from "@prismicio/types-internal/lib/customtypes";

const widgetEntries = Object.entries(Widgets);

describe("Widgets", () => {
  test.each(widgetEntries)(
    "%s: schema validates configuration of newly created fields",
    (name, widget) => {
      if (!widget) throw new Error("Error, widget is not defined");
      const field = widget?.create(name);

      expect(
        widget?.schema.isValidSync(
          {
            type: field?.type,
            config: field?.config,
          },
          { stripUnknown: true }
        )
      ).toBeTruthy();
    }
  );

  test.each(widgetEntries)(
    "%s: fields created by slicemachine are written in the filesystem without modification",
    (name, widget) => {
      if (!widget) throw new Error("Error, widget is not defined");
      const fieldExpected: NestableWidget | UID = widget.create(name);

      // create a fake custom type so we can call the helpers
      const customTypeSM: CustomTypeSM = {
        id: "fake_slice",
        label: null,
        repeatable: true,
        format: "custom",
        tabs: [
          {
            key: "Main",
            value: [
              {
                key: "field",
                value: fieldExpected,
              },
            ],
          },
        ],
        status: true,
      };

      // turn the custom type from SM into the Custom type that will be written in the File system
      const customType: CustomType = CustomTypes.fromSM(customTypeSM);
      const field = customType.json["Main"]["field"];

      // compare the two fields to ensure that what slicemachine creates is what is written in the file system.
      expect(field).toBeDefined();
      expect(field).toEqual(fieldExpected);
    }
  );

  // Issue: https://github.com/prismicio/slice-machine/issues/672
  test("allow resetting image constraints to auto when width and height values are empty strings", () => {
    const field = Widgets.Image.create("Image");

    expect(
      Widgets.Image.schema.isValidSync(
        {
          type: field?.type,
          config: {
            ...field?.config,
            constraint: {
              width: "",
              height: "",
            },
          },
        },
        { stripUnknown: true }
      )
    ).toBeTruthy();
  });
});
