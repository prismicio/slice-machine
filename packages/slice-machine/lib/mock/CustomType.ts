import {
  CustomType as PrismicCustomType,
  flattenWidgets,
} from "@prismicio/types-internal/lib/customtypes/CustomType";
import {
  DocumentMockConfig,
  DocWidgetMockConfig,
  generateDocumentMock,
  renderDocumentMock,
} from "@prismicio/mocks";
import { CustomTypeMockConfig } from "@lib/models/common/MockConfig";
import { CustomTypeJsonModel } from "../models/common/CustomType";
import { PartialRecord, buildWidgetMockConfig } from "./LegacyMockConfig";
import { WidgetKey } from "@prismicio/types-internal/lib/documents/widgets";

function buildDocumentMockConfig(
  model: PrismicCustomType,
  legacyMockConfig: CustomTypeMockConfig
): DocumentMockConfig {
  const widgets = flattenWidgets(model);
  const widgetsConfig = widgets.reduce<
    Partial<Record<WidgetKey, DocWidgetMockConfig>>
  >((acc, [key, w]) => {
    const legacyFieldConfig: PartialRecord<unknown> | undefined =
      legacyMockConfig[key];
    if (!legacyFieldConfig) return acc;

    const widgetConfig = buildWidgetMockConfig(w, legacyFieldConfig);
    if (!widgetConfig) return acc;

    return { ...acc, [key]: widgetConfig };
  }, {});

  return { value: widgetsConfig };
}

export default function MockCustomType(
  model: CustomTypeJsonModel,
  legacyMockConfig: CustomTypeMockConfig
) {
  const prismicModel = model as unknown as PrismicCustomType;
  const documentMockConfig = buildDocumentMockConfig(
    prismicModel,
    legacyMockConfig
  );
  return generateDocumentMock(
    prismicModel,
    {},
    documentMockConfig
  )(renderDocumentMock);
}
