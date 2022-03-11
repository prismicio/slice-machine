import { Box } from "theme-ui";

import { ensureDnDDestination } from "@lib/utils";
import { transformKeyAccessor } from "@utils/str";

import Zone from "../../common/Zone";
import EditModal from "../../common/EditModal";
import type { Models } from "@slicemachine/core";
import { WidgetsArea } from "@slicemachine/core/build/src/models/Variation";

import * as Widgets from "@lib/models/common/widgets";
import sliceBuilderWidgetsArray from "@lib/models/common/widgets/sliceBuilderArray";

import { SliceMockConfig } from "@models/common/MockConfig";
import SliceState from "@models/ui/SliceState";
import SliceStore from "@src/models/slice/store";
import { DropResult } from "react-beautiful-dnd";
import { createFriendlyFieldNameWithId } from "@src/utils/fieldNameCreator";

const dataTipText = ` The non-repeatable zone
  is for fields<br/> that should appear once, like a<br/>
  section title.
`;
const dataTipText2 = `The repeatable zone is for a group<br/>
  of fields that you want to be able to repeat an<br/>
  indeterminate number of times, like FAQs`;

type FieldZonesProps = {
  Model: SliceState;
  variation: Models.VariationAsArray;
  store: SliceStore;
};

const FieldZones: React.FunctionComponent<FieldZonesProps> = ({
  Model,
  store,
  variation,
}) => {
  const _onDeleteItem = (widgetArea: Models.WidgetsArea) => (key: string) => {
    store
      .variation(variation.id)
      .deleteWidgetMockConfig(Model.mockConfig, widgetArea, key);
    store.variation(variation.id).removeWidget(widgetArea, key);
  };

  const _getFieldMockConfig =
    (widgetArea: Models.WidgetsArea) =>
    ({ apiId }: { apiId: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return SliceMockConfig.getFieldMockConfig(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
        Model.mockConfig,
        variation.id,
        widgetArea,
        apiId
      );
    };

  const _onSave =
    (widgetArea: Models.WidgetsArea) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ apiId: previousKey, newKey, value, mockValue }: any) => {
      if (mockValue) {
        store
          .variation(variation.id)
          .updateWidgetMockConfig(
            Model.mockConfig,
            widgetArea,
            previousKey,
            newKey,
            mockValue
          );
      } else {
        store
          .variation(variation.id)
          .deleteWidgetMockConfig(Model.mockConfig, widgetArea, newKey);
      }
      store
        .variation(variation.id)
        .replaceWidget(widgetArea, previousKey, newKey, value);
    };

  const _onSaveNewField =
    (widgetArea: Models.WidgetsArea) =>
    ({ id, widgetTypeName }: { id: string; widgetTypeName: string }) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const widget = Widgets[widgetTypeName];
      if (!widget) {
        console.log(
          `Could not find widget with type name "${widgetTypeName}". Please contact us!`
        );
      }

      const friendlyName = createFriendlyFieldNameWithId(id);

      store
        .variation(variation.id)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        .addWidget(widgetArea, id, widget.create(friendlyName));
    };

  const _onDragEnd =
    (widgetArea: Models.WidgetsArea) => (result: DropResult) => {
      if (ensureDnDDestination(result)) {
        return;
      }
      store
        .variation(variation.id)
        .reorderWidget(
          widgetArea,
          result.source.index,
          result.destination && result.destination.index
        );
    };

  return (
    <>
      <Zone
        Model={Model}
        title="Non-Repeatable Zone"
        dataTip={dataTipText}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
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
      />
      <Box mt={4} />
      <Zone
        isRepeatable
        Model={Model}
        title="Repeatable Zone"
        dataTip={dataTipText2}
        widgetsArray={sliceBuilderWidgetsArray}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
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
      />
    </>
  );
};

export default FieldZones;
