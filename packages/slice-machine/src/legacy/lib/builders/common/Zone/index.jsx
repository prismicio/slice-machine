import { Button, Switch, Text } from "@prismicio/editor-ui";
import { array, arrayOf, bool, func, object, shape, string } from "prop-types";
import { useState } from "react";
import { BaseStyles } from "theme-ui";

import { telemetry } from "@/apiClient";
import { ListHeader } from "@/components/List";
import { getContentTypeForTracking } from "@/utils/getContentTypeForTracking";

import SelectFieldTypeModal from "../SelectFieldTypeModal";
import Card from "./Card";
import NewField from "./Card/components/NewField";
import { ZoneEmptyState } from "./components/ZoneEmptyState";

const Zone = ({
  zoneType /* type of the zone: customType or slice */,
  zoneTypeFormat /* format of the zone: page or custom */,
  tabId,
  title /* text info to display in Card Header */,
  fields /* widgets registered in the zone */,
  poolOfFieldsToCheck /* if you need to check unicity of fields from other zones */,
  widgetsArray /* Array of available widget fields */,
  isRepeatable /* should we wrap hints in map ? */,
  onDeleteItem /* user clicked on "Delete field" */,
  onSaveNewField /* user clicked on "Save" (NewField) */,
  onDragEnd /* user dragged item to an end location */,
  EditModal /* temp */,
  onSave /* user clicked on "Save" (EditModal) */,
  dataTip /* text info to display as tip */,
  renderHintBase /* render base (eg. path to slice) content for hints */,
  renderFieldAccessor /* render field accessor (eg. slice.primary.title) */,
  testId,
  isRepeatableCustomType,
  emptyStateHeading,
  emptyStateActionTestId,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const widgetsArrayWithCondUid = (() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
    const hasUid = !!Object.entries(poolOfFieldsToCheck).find(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      ([, { value }]) => value.type === "UID",
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return hasUid
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        widgetsArray.filter(({ TYPE_NAME }) => TYPE_NAME !== "UID")
      : widgetsArray;
  })();

  const [showHints, setShowHints] = useState(false);
  const [editModalData, setEditModalData] = useState({ isOpen: false });
  const [selectModalData, setSelectModalData] = useState({ isOpen: false });
  const [newFieldData, setNewFieldData] = useState(null);

  /** @param {[string, import("@prismicio/types-internal/lib/customtypes").NestableWidget]} field */
  const enterEditMode = (field) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    setEditModalData({ isOpen: true, field });

    const [id, model] = field;
    void telemetry.track({
      event: "field:settings-opened",
      id,
      name: model.config.label,
      type: model.type,
      isInAGroup: false,
      contentType: getContentTypeForTracking(window.location.pathname),
    });
  };
  const enterSelectMode = () => {
    setSelectModalData({ isOpen: true });
  };

  const closeEditModal = () => {
    setEditModalData({ isOpen: false });
  };
  const closeSelectModal = () => setSelectModalData({ isOpen: false });

  const onSelectFieldType = (widgetTypeName) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
    setNewFieldData({ widgetTypeName, fields });
    setSelectModalData({ isOpen: false });
  };

  const onCancelNewField = () => setNewFieldData(null);

  return (
    <>
      <ListHeader
        actions={
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          fields.length > 0 ? (
            <>
              <Text color="grey11" component="span" noWrap>
                Show code snippets?
              </Text>
              <Switch
                checked={showHints}
                onCheckedChange={setShowHints}
                size="small"
                // TODO(DT-1710): add the missing `flexShrink: 0` property to the Editor's Switch component.
                style={{ flexShrink: 0 }}
                data-testid="code-snippets-switch"
              />
              <Button
                data-testid={`add-${
                  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                  isRepeatable ? "Repeatable" : "Static"
                }-field`}
                onClick={enterSelectMode}
                startIcon="add"
                color="grey"
                disabled={newFieldData !== null}
              >
                Add a field
              </Button>
            </>
          ) : undefined
        }
      >
        {title}
      </ListHeader>
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
        fields.length === 0 && !newFieldData ? (
          <ZoneEmptyState
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            zoneType={getResolvedZoneType(zoneType, zoneTypeFormat)}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            heading={emptyStateHeading}
            onActionClick={() => enterSelectMode()}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            actionTestId={emptyStateActionTestId}
          />
        ) : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
        fields.length > 0 || newFieldData ? (
          <BaseStyles>
            <Card
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
              tabId={tabId}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              isRepeatable={isRepeatable}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              fields={fields}
              showHints={showHints}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              dataTip={dataTip}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
              title={title}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              renderFieldAccessor={renderFieldAccessor}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
              renderHintBase={renderHintBase}
              enterEditMode={enterEditMode}
              enterSelectMode={enterSelectMode}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              onDragEnd={onDragEnd}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              onDeleteItem={onDeleteItem}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              onSave={onSave}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              testId={testId}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              isRepeatableCustomType={isRepeatableCustomType}
              newField={
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                newFieldData && (
                  <NewField
                    {...newFieldData}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/strict-boolean-expressions
                    fields={poolOfFieldsToCheck || fields}
                    onSave={(...args) => {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                      onSaveNewField(...args);
                      setNewFieldData(null);
                    }}
                    onCancelNewField={onCancelNewField}
                  />
                )
              }
            />
          </BaseStyles>
        ) : undefined
      }
      <EditModal
        data={editModalData}
        close={closeEditModal}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        onSave={onSave}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
        fields={poolOfFieldsToCheck}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        zoneType={zoneType}
      />
      <SelectFieldTypeModal
        data={selectModalData}
        close={closeSelectModal}
        onSelect={onSelectFieldType}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        widgetsArray={widgetsArrayWithCondUid}
      />
    </>
  );
};

Zone.propTypes = {
  isRepeatable: bool,
  title: string.isRequired,
  dataTip: string.isRequired,
  onSave: func.isRequired,
  onSaveNewField: func.isRequired,
  onDragEnd: func.isRequired,
  onDeleteItem: func.isRequired,
  poolOfFieldsToCheck: arrayOf(shape({ key: string, value: object })),
  renderHintBase: func.isRequired,
  renderFieldAccessor: func.isRequired,
  widgetsArray: array.isRequired,
  fields: arrayOf(
    shape({
      key: string.isRequired,
      value: shape({
        config: object,
        fields: array,
        type: string.isRequired,
      }),
    }),
  ),
};

/**
 * Determines the resolved type of a given zone type.
 *
 * @param {"customType" | "slice"} zoneType - The type of the zone.
 * @param {"page" | "custom"} [format] - The format of the zone type (if applicable).
 *
 * @returns {"custom type" | "page type" | "slice"}
 */
function getResolvedZoneType(zoneType, format) {
  if (zoneType === "customType") {
    return format === "page" ? "page type" : "custom type";
  }

  return zoneType;
}

export default Zone;
