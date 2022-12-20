import getEnv from "../services/getEnv";
import { Files } from "@slicemachine/core/build/node-utils";
import {
  CustomTypesPaths,
  GeneratedCustomTypesPaths,
} from "../../../../lib/models/paths";

import { insert as insertMockConfig } from "../../../../lib/mock/misc/fs";

import mock from "../../../../lib/mock/CustomType";
import { CustomTypeMockConfig } from "../../../../lib/models/common/MockConfig";
import { SaveCustomTypeBody } from "../../../../lib/models/common/CustomType";
import * as IO from "../../../../lib/io";
import * as Libraries from "@slicemachine/core/build/libraries";
import { Component, Slices } from "@slicemachine/core/build/models";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

export default function handler(req: { body: SaveCustomTypeBody }) {
  const { env } = getEnv();
  const { model, mockConfig } = req.body;

  const mockPath = GeneratedCustomTypesPaths(env.cwd)
    .customType(model.id)
    .mock();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const updatedMockConfig = insertMockConfig(env.cwd, {
    key: model.id,
    prefix: "_cts",
    value: mockConfig,
  });

  const modelPath = CustomTypesPaths(env.cwd).customType(model.id).model();
  IO.CustomType.writeCustomType(modelPath, model);

  const libraries = env.manifest.libraries
    ? Libraries.libraries(env.cwd, env.manifest.libraries)
    : [];

  const components = libraries.reduce<Component[]>((acc, lib) => {
    return [...acc, ...lib.components];
  }, []);

  const sharedSlices = components.reduce<Record<string, SharedSlice>>(
    (acc, component) => {
      const slice = Slices.fromSM(component.model);
      return {
        ...acc,
        [slice.id]: slice,
      };
    },
    {}
  );

  const mocked = mock(
    model,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    CustomTypeMockConfig.getCustomTypeMockConfig(updatedMockConfig, model.id),
    sharedSlices
  );

  Files.writeJson(mockPath, mocked);

  IO.Types.upsert(env);

  return {};
}
