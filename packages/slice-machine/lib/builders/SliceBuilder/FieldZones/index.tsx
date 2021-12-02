import { Box } from "theme-ui";

import { ensureDnDDestination } from "@lib/utils";
import { transformKeyAccessor } from "@utils/str";

import Zone from "../../common/Zone";
import EditModal from "../../common/EditModal";
import type Models from "@slicemachine/core/build/src/models";
import { WidgetsArea } from "@slicemachine/core/build/src/models/Variation";

import * as Widgets from "@lib/models/common/widgets";
import sliceBuilderWidgetsArray from "@lib/models/common/widgets/sliceBuilderArray";

import { SliceMockConfig } from "@models/common/MockConfig";
import SliceState from "@models/ui/SliceState";
import SliceStore from "@src/models/slice/store";
import { DropResult } from "react-beautiful-dnd";

const dataTipText: string = ` The non-repeatable zone
  is for fields<br/> that should appear once, like a<br/>
  section title.
`;
const dataTipText2: string = `The repeatable zone is for a group<br/>
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
      return SliceMockConfig.getFieldMockConfig(
        Model.mockConfig,
        variation.id,
        widgetArea,
        apiId
      );
    };

  const _onSave =
    (widgetArea: Models.WidgetsArea) =>
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
      // @ts-expect-error
      const widget = Widgets[widgetTypeName];
      if (!widget) {
        console.log(
          `Could not find widget with type name "${widgetTypeName}". Please contact us!`
        );
      }
      store
        .variation(variation.id)
        .addWidget(widgetArea, id, widget.create(id));
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
        title="Non-Repeatable zone"
        dataTip={dataTipText}
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
          `slice.primary${transformKeyAccessor(item.key)}`
        }
        renderFieldAccessor={(key) =>
          `slice.primary${transformKeyAccessor(key)}`
        }
      />
      <Box mt={4} />
      <Zone
        isRepeatable
        Model={Model}
        title="Repeatable zone"
        dataTip={dataTipText2}
        widgetsArray={sliceBuilderWidgetsArray}
        // @ts-expect-error
        fields={variation.items}
        EditModal={EditModal}
        getFieldMockConfig={_getFieldMockConfig(WidgetsArea.Items)}
        onDeleteItem={_onDeleteItem(WidgetsArea.Items)}
        onSave={_onSave(WidgetsArea.Items)}
        onSaveNewField={_onSaveNewField(WidgetsArea.Items)}
        onDragEnd={_onDragEnd(WidgetsArea.Items)}
        poolOfFieldsToCheck={variation.items || []}
        renderHintBase={({ item }) => `item${transformKeyAccessor(item.key)}`}
        renderFieldAccessor={(key) =>
          `slice.items[i]${transformKeyAccessor(key)}`
        }
      />
    </>
  );
};

export default FieldZones;
