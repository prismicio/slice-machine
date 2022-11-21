import {
  CustomType,
  flattenWidgets,
} from "@prismicio/types-internal/lib/customtypes/CustomType";
import {
  DocumentMockConfig,
  DocWidgetMockConfig,
  generateDocumentMock,
} from "@prismicio/mocks";
import { CustomTypeMockConfig } from "../models/common/MockConfig";
import { buildWidgetMockConfig } from "./LegacyMockConfig";
import { WidgetKey } from "@prismicio/types-internal/lib/documents/widgets";
import {
  CustomTypes,
  CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType";
import * as Content from "@prismicio/types-internal";
import * as Either from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

function buildDocumentMockConfig(
  model: CustomType,
  legacyMockConfig: CustomTypeMockConfig
): DocumentMockConfig {
  const widgets = flattenWidgets(model);
  const widgetsConfig = widgets.reduce<
    Partial<Record<WidgetKey, DocWidgetMockConfig>>
  >((acc, [key, w]) => {
    const legacyFieldConfig: Partial<Record<string, unknown>> | undefined =
      legacyMockConfig[key];
    if (!legacyFieldConfig) return acc;

    const widgetConfig = buildWidgetMockConfig(w, legacyFieldConfig);
    if (!widgetConfig) return acc;

    return { ...acc, [key]: widgetConfig };
  }, {});

  return { value: widgetsConfig };
}

export default function MockCustomType(
  model: CustomTypeSM,
  legacyMockConfig: CustomTypeMockConfig
): Content.CustomTypes.CustomType | null {
  const prismicModel = CustomTypes.fromSM(model);
  const documentMockConfig = buildDocumentMockConfig(
    prismicModel,
    legacyMockConfig
  );

  const maybeMock = generateDocumentMock(
    prismicModel,
    {}, // TBD: should we add shared slices?
    documentMockConfig
  )((_customTypes, _sharedSlices, mock) => mock);

  const mock = pipe(
    Content.CustomTypes.CustomType.decode(maybeMock),
    Either.getOrElseW((errors) => {
      console.error(`Could not create mock for ${model.id}`);
      console.error(errors);
      // const messages = errors.map((error) => error.message).join("\n")
      // console.error(messages)
      return null;
    })
  );
  return mock;
}
