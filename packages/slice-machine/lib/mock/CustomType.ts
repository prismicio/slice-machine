import {
  CustomType,
  flattenWidgets,
  SharedSlice,
} from "@prismicio/types-internal/lib/customtypes";
import {
  DocumentMockConfig,
  DocWidgetMockConfig,
  DocumentMock,
} from "@prismicio/mocks";
import { CustomTypeMockConfig } from "../models/common/MockConfig";
import { buildWidgetMockConfig } from "./LegacyMockConfig";
import { WidgetKey } from "@prismicio/types-internal/lib/common";
import {
  CustomTypes,
  CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType";
import { Document } from "@prismicio/types-internal/lib/content";

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
): Partial<Document> {
  const prismicModel = CustomTypes.fromSM(model);
  const documentMockConfig = buildDocumentMockConfig(
    prismicModel,
    legacyMockConfig
  );

  return DocumentMock.generate(prismicModel, sharedSlices, documentMockConfig);
}
