import {
  CustomType,
  flattenWidgets,
} from "@prismicio/types-internal/lib/customtypes/CustomType";
import {
  DocumentMockConfig,
  DocWidgetMockConfig,
  generateDocumentMock,
  renderDocumentMock,
} from "@prismicio/mocks";
import { CustomTypeMockConfig } from "../models/common/MockConfig";
import { buildWidgetMockConfig } from "./LegacyMockConfig";
import {
  WidgetContent,
  WidgetKey,
} from "@prismicio/types-internal/lib/documents/widgets";
import {
  CustomTypes,
  CustomTypeSM,
} from "@slicemachine/core/build/models/CustomType";

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
): Partial<Record<string, WidgetContent>> {
  const prismicModel = CustomTypes.fromSM(model);
  const documentMockConfig = buildDocumentMockConfig(
    prismicModel,
    legacyMockConfig
  );

  return generateDocumentMock(
    prismicModel,
    {}, // TBD: should we add shared slices?
    documentMockConfig
  )((_customTypes, _sharedSlices, mock) => mock) as Partial<
    Record<string, WidgetContent>
  >;
}
