import { describe, test, expect } from "@jest/globals";
import {
  formatPath,
  validateCustomTypeModel,
  validateSliceModel,
} from "../../../scripts/start/validateModels";
import { customTypeMock } from "../../__mocks__/customType";
import sliceMock from "../../__mocks__/sliceModel";
import { CustomTypes } from "@slicemachine/core/build/models/CustomType/index";
import { Slices } from "@slicemachine/core/build/models/Slice";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";

describe("[Scripts] Start - Validate Models", () => {
  const cwd: string = "/DEV/MYSELF/";
  const sliceLibrary = "slices";

  test("formatPath should give a relative path for a Slice", () => {
    const info = {
      library: sliceLibrary,
      sliceName: "default",
    };

    expect(formatPath(cwd, info)).toEqual(
      `./${info.library}/${info.sliceName}/model.json`
    );
  });

  test("formatPath should give a relative path for a Custom type", () => {
    const info = {
      customTypeId: "default",
    };

    expect(formatPath(cwd, info)).toEqual(
      `./customtypes/${info.customTypeId}/index.json`
    );
  });

  test("validateCustomTypeModel doesn't return any error if the custom type is valid", () => {
    const potentialErrors = validateCustomTypeModel(
      cwd,
      CustomTypes.toSM(customTypeMock)
    );
    expect(potentialErrors.length).toBe(0);
  });

  test("validateCustomTypeModel should fail if a field API ID is empty", () => {
    const model = {
      ...customTypeMock,
      json: {
        Main: {
          "": {
            type: WidgetTypes.UID,
            config: {
              label: "Uid",
              placeholder: "",
            },
          },
        },
      },
    };

    const potentialErrors = validateCustomTypeModel(
      cwd,
      CustomTypes.toSM(model)
    );
    expect(potentialErrors.length).toBe(1);
  });

  test("validateCustomTypeModel should fail if a field API ID has special characters", () => {
    const model = {
      ...customTypeMock,
      json: {
        Main: {
          "u<i>d": {
            type: WidgetTypes.Text,
            config: {
              label: "Social Card Title",
            },
          },
        },
      },
    };

    const potentialErrors = validateCustomTypeModel(
      cwd,
      CustomTypes.toSM(model)
    );
    expect(potentialErrors.length).toBe(1);

    const model2 = {
      ...customTypeMock,
      json: {
        Main: {
          "ric@&1": {
            type: WidgetTypes.Text,
            config: {
              label: "Social Card Title",
            },
          },
        },
      },
    };

    const potentialErrors2 = validateCustomTypeModel(
      cwd,
      CustomTypes.toSM(model2)
    );
    expect(potentialErrors2.length).toBe(1);
  });

  test("validateSliceModel doesn't return any error if the slice is valid", () => {
    const potentialErrors = validateSliceModel(
      cwd,
      sliceLibrary,
      Slices.toSM(sliceMock)
    );
    expect(potentialErrors.length).toBe(0);
  });

  test("validateSliceModel should fail if a field API ID is empty", () => {
    const model: SharedSlice = {
      ...sliceMock,
      variations: [
        ...sliceMock.variations,
        {
          id: "test",
          name: "test variaation",
          imageUrl: "",
          docURL: "...",
          version: "random",
          description: "just a variation for testing purpose",
          primary: {
            "": {
              ...sliceMock.variations[0].primary!["rich-1"],
            },
          },
          items: {},
        },
      ],
    };

    const potentialErrors = validateSliceModel(
      cwd,
      sliceLibrary,
      Slices.toSM(model)
    );
    expect(potentialErrors.length).toBe(1);
  });

  test("validateSliceModel should fail if a field API ID has special characters", () => {
    const model: SharedSlice = {
      ...sliceMock,
      variations: [
        ...sliceMock.variations,
        {
          id: "test",
          name: "test variaation",
          imageUrl: "",
          docURL: "...",
          version: "random",
          description: "just a variation for testing purpose",
          primary: {
            "te>s<t": {
              ...sliceMock.variations[0].primary!["rich-1"],
            },
          },
          items: {},
        },
      ],
    };

    const potentialErrors = validateSliceModel(
      cwd,
      sliceLibrary,
      Slices.toSM(model)
    );
    expect(potentialErrors.length).toBe(1);
  });

  test("validateSliceModel should fail if the slice API ID has special characters", () => {
    const model: SharedSlice = {
      ...sliceMock,
      id: "some><>-value",
    };

    const potentialErrors = validateSliceModel(
      cwd,
      sliceLibrary,
      Slices.toSM(model)
    );
    expect(potentialErrors.length).toBe(1);
  });
});
