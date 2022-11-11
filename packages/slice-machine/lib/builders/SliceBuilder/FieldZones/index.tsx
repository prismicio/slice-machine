import { Box } from "theme-ui";

import { ensureDnDDestination } from "@lib/utils";
import { transformKeyAccessor } from "@utils/str";

import Zone from "../../common/Zone";
import EditModal from "../../common/EditModal";
import type { Models } from "@slicemachine/core";
import { WidgetsArea } from "@slicemachine/core/build/models/Slice";

import * as Widgets from "@lib/models/common/widgets";
import sliceBuilderWidgetsArray from "@lib/models/common/widgets/sliceBuilderArray";

import {
  CustomTypeMockConfig,
  SliceMockConfig,
} from "@models/common/MockConfig";
import { DropResult } from "react-beautiful-dnd";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";

const dataTipText = ` The non-repeatable zone
  is for fields<br/> that should appear once, like a<br/>
  section title.
`;
const dataTipText2 = `The repeatable zone is for a group<br/>
  of fields that you want to be able to repeat an<br/>
  indeterminate number of times, like FAQs`;

type FieldZonesProps = {
  mockConfig: CustomTypeMockConfig;
  variation: Models.VariationSM;
};

const FieldZones: React.FunctionComponent<FieldZonesProps> = ({
  mockConfig,
  variation,
}) => {
  const {
    addSliceWidget,
    replaceSliceWidget,
    reorderSliceWidget,
    removeSliceWidget,
    updateSliceWidgetMock,
    deleteSliceWidgetMock,
  } = useSliceMachineActions();
  const _onDeleteItem = (widgetArea: Models.WidgetsArea) => (key: string) => {
    deleteSliceWidgetMock(variation.id, mockConfig, widgetArea, key);
    removeSliceWidget(variation.id, widgetArea, key);
  };

  const _getFieldMockConfig =
    (widgetArea: Models.WidgetsArea) =>
    ({ apiId }: { apiId: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return SliceMockConfig.getFieldMockConfig(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
        mockConfig,
        variation.id,
        widgetArea,
        apiId
      );
    };

  const _onSave =
    (widgetArea: Models.WidgetsArea) =>
    ({
      apiId: previousKey,
      newKey,
      value,
      mockValue,
    }: {
      apiId: string;
      newKey: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockValue: any;
    }) => {
      if (mockValue) {
        updateSliceWidgetMock(
          variation.id,
          mockConfig,
          widgetArea,
          previousKey,
          newKey,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          mockValue
        );
      } else {
        deleteSliceWidgetMock(variation.id, mockConfig, widgetArea, newKey);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      replaceSliceWidget(variation.id, widgetArea, previousKey, newKey, value);
    };

  const _onSaveNewField =
    (widgetArea: Models.WidgetsArea) =>
    ({
      id,
      label,
      widgetTypeName,
    }: {
      id: string;
      label: string;
      widgetTypeName: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const widget = Widgets[widgetTypeName];
      if (!widget) {
        console.log(
          `Could not find widget with type name "${widgetTypeName}". Please contact us!`
        );
      }

      addSliceWidget(
        variation.id,
        widgetArea,
        id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        widget.create(label) as NestableWidget
      );
    };

  const _onDragEnd =
    (widgetArea: Models.WidgetsArea) => (result: DropResult) => {
      if (ensureDnDDestination(result)) {
        return;
      }
      reorderSliceWidget(
        variation.id,
        widgetArea,
        result.source.index,
        result.destination && result.destination.index
      );
    };

  return (
    <>
      <Zone
        tabId={undefined}
        mockConfig={mockConfig}
        title="Non-Repeatable Zone"
        dataTip={dataTipText}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        fields={variation.primary}
        EditModal={EditModal}
        widgetsArray={sliceBuilderWidgetsArray}
        getFieldMockConfig={_getFieldMockConfig(WidgetsArea.Primary)}
        onDeleteItem={_onDeleteItem(WidgetsArea.Primary)}
        onSave={_onSave(WidgetsArea.Primary)}
        onSaveNewField={_onSaveNewField(WidgetsArea.Primary)}
        onDragEnd={_onDragEnd(WidgetsArea.Primary)}
        poolOfFieldsToCheck={variation.primary || []}
        renderHintBase={({ item }) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          `slice.primary${transformKeyAccessor(item.key)}`
        }
        renderFieldAccessor={(key) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          `slice.primary${transformKeyAccessor(key)}`
        }
        dataCy="slice-non-repeatable-zone"
      />
      <Box mt={4} />
      <Zone
        tabId={undefined}
        isRepeatable
        mockConfig={mockConfig}
        title="Repeatable Zone"
        dataTip={dataTipText2}
        widgetsArray={sliceBuilderWidgetsArray}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        fields={variation.items}
        EditModal={EditModal}
        getFieldMockConfig={_getFieldMockConfig(WidgetsArea.Items)}
        onDeleteItem={_onDeleteItem(WidgetsArea.Items)}
        onSave={_onSave(WidgetsArea.Items)}
        onSaveNewField={_onSaveNewField(WidgetsArea.Items)}
        onDragEnd={_onDragEnd(WidgetsArea.Items)}
        poolOfFieldsToCheck={variation.items || []}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        renderHintBase={({ item }) => `item${transformKeyAccessor(item.key)}`}
        renderFieldAccessor={(key) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          `slice.items[i]${transformKeyAccessor(key)}`
        }
        dataCy="slice-repeatable-zone"
      />
    </>
  );
};

export default FieldZones;
