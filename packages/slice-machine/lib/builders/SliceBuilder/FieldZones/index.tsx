import { Box } from "theme-ui";

import { ensureDnDDestination } from "@lib/utils";
import { transformKeyAccessor } from "@utils/str";

import Zone from "../../common/Zone";
import EditModal from "../../common/EditModal";

import * as Widgets from "@lib/models/common/widgets";
import sliceBuilderWidgetsArray from "@lib/models/common/widgets/sliceBuilderArray";

import { DropResult } from "react-beautiful-dnd";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { VariationSM, WidgetsArea } from "@lib/models/common/Slice";

import { NestableWidget } from "@prismicio/types-internal/lib/customtypes";

const dataTipText = ` The non-repeatable zone
  is for fields<br/> that should appear once, like a<br/>
  section title.
`;
const dataTipText2 = `The repeatable zone is for a group<br/>
  of fields that you want to be able to repeat an<br/>
  indeterminate number of times, like FAQs`;

type FieldZonesProps = {
  variation: VariationSM;
};

const FieldZones: React.FunctionComponent<FieldZonesProps> = ({
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
  const _onDeleteItem = (widgetArea: WidgetsArea) => (key: string) => {
    deleteSliceWidgetMock(variation.id, widgetArea, key);
    removeSliceWidget(variation.id, widgetArea, key);
  };

  const _onSave =
    (widgetArea: WidgetsArea) =>
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
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (mockValue) {
        updateSliceWidgetMock(
          variation.id,
          widgetArea,
          previousKey,
          newKey,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          mockValue
        );
      } else {
        deleteSliceWidgetMock(variation.id, widgetArea, newKey);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      replaceSliceWidget(variation.id, widgetArea, previousKey, newKey, value);
    };

  const _onSaveNewField =
    (widgetArea: WidgetsArea) =>
    ({
      id,
      label,
      widgetTypeName,
    }: {
      id: string;
      label: string;
      widgetTypeName: string;
    }) => {
      // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const widget = Widgets[widgetTypeName];
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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

  const _onDragEnd = (widgetArea: WidgetsArea) => (result: DropResult) => {
    if (ensureDnDDestination(result)) return;

    reorderSliceWidget(
      variation.id,
      widgetArea,
      result.source.index,
      result.destination?.index ?? undefined
    );
  };

  return (
    <>
      <Zone
        zoneType="slice"
        tabId={undefined}
        title="Non-Repeatable Zone"
        dataTip={dataTipText}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        fields={variation.primary}
        EditModal={EditModal}
        widgetsArray={sliceBuilderWidgetsArray}
        onDeleteItem={_onDeleteItem(WidgetsArea.Primary)}
        onSave={_onSave(WidgetsArea.Primary)}
        onSaveNewField={_onSaveNewField(WidgetsArea.Primary)}
        onDragEnd={_onDragEnd(WidgetsArea.Primary)}
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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
        isRepeatableCustomType={undefined}
      />
      <Box mt={4} />
      <Zone
        zoneType="slice"
        tabId={undefined}
        isRepeatable
        title="Repeatable Zone"
        dataTip={dataTipText2}
        widgetsArray={sliceBuilderWidgetsArray}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        fields={variation.items}
        EditModal={EditModal}
        onDeleteItem={_onDeleteItem(WidgetsArea.Items)}
        onSave={_onSave(WidgetsArea.Items)}
        onSaveNewField={_onSaveNewField(WidgetsArea.Items)}
        onDragEnd={_onDragEnd(WidgetsArea.Items)}
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        poolOfFieldsToCheck={variation.items || []}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        renderHintBase={({ item }) => `item${transformKeyAccessor(item.key)}`}
        renderFieldAccessor={(key) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          `slice.items[i]${transformKeyAccessor(key)}`
        }
        dataCy="slice-repeatable-zone"
        isRepeatableCustomType={undefined}
      />
    </>
  );
};

export default FieldZones;
