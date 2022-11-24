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
import { CustomTypeContent } from "@prismicio/types-internal/lib/content";
import { getOrElseW } from "fp-ts/lib/Either";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";

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
  legacyMockConfig: CustomTypeMockConfig,
  sharedSlices: Record<string, SharedSlice>
): CustomTypeContent | null {
  const prismicModel = CustomTypes.fromSM(model);
  const documentMockConfig = buildDocumentMockConfig(
    prismicModel,
    legacyMockConfig
  );

  const mock = generateDocumentMock(
    prismicModel,
    sharedSlices,
    documentMockConfig
  )((_customTypes, _sharedSlices, mock) => mock);

  return getOrElseW(() => {
    console.error(`Could not parse mock for ${prismicModel.id}`);
    return null;
  })(CustomTypeContent.decode(mock));
}
