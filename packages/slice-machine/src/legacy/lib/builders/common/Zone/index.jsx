import { Switch, Text } from "@prismicio/editor-ui";
import { array, arrayOf, bool, func, object, shape, string } from "prop-types";
import { useState } from "react";
import { BaseStyles } from "theme-ui";

import { telemetry } from "@/apiClient";
import { ListHeader } from "@/components/List";
import { fields as allFields } from "@/domain/fields";
import { AddFieldDropdown } from "@/features/builder/AddFieldDropdown";
import { AddStaticFieldDropdown } from "@/features/builder/AddStaticFieldDropdown";
import { Widgets } from "@/legacy/lib/models/common/widgets";
import { getContentTypeForTracking } from "@/utils/tracking/getContentTypeForTracking";

import Card from "./Card";
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
  onDragEnd /* user dragged item to an end location */,
  EditModal /* temp */,
  onSave /* user clicked on "Save" (EditModal) */,
  dataTip /* text info to display as tip */,
  renderHintBase /* render base (eg. path to slice) content for hints */,
  renderFieldAccessor /* render field accessor (eg. slice.primary.title) */,
  testId,
  isRepeatableCustomType,
  emptyStateHeading,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const widgetsArrayWithCondUid = (() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
    const hasUid = !!Object.entries(poolOfFieldsToCheck).find(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      ([, { value }]) => value.type === "UID",
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const widgets = widgetsArray.filter(({ TYPE_NAME }) => TYPE_NAME !== "UID");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (hasUid) return widgets;

    // Move UID widget to the end of the array because it is used very rarely

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const uidField = widgetsArray.find(({ TYPE_NAME }) => TYPE_NAME === "UID");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return [...widgets, uidField];
  })();

  const [showHints, setShowHints] = useState(false);
  const [editModalData, setEditModalData] = useState({ isOpen: false });

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

  const closeEditModal = () => {
    setEditModalData({ isOpen: false });
  };

  /** @param {keyof typeof Widgets} widgetTypeName */
  const onSelectFieldType = (widgetTypeName) => {
    /** `widgetTypeName` might have less keys than `Widgets`, but we lost track 
    of the types because the `widgetsArray` is not typed and is also filtered into 
    `widgetsArrayWithCondUid`. Although, it's safe to use it to index the `Widgets` 
    as long as `widgetsArrayWithCondUid` is a subset of `widgetsArray`.*/
    const field = Widgets[widgetTypeName].create("");
    setEditModalData({ isOpen: true, field: ["", field] });
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const addFieldDropdownFields = widgetsArrayWithCondUid
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .filter(Boolean)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .map((widget) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { TYPE_NAME, CUSTOM_NAME } = widget;
      return allFields.find(
        (f) =>
          f.type === TYPE_NAME &&
          (CUSTOM_NAME === undefined || f.variant === CUSTOM_NAME),
      );
    });

  const addFieldDropdownProps = {
    onSelectField: onSelectFieldType,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    fields: addFieldDropdownFields,
    triggerDataTestId: Boolean(isRepeatable) ? "add-field-in-items" : undefined,
  };

  let addFieldDropdown;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (zoneType === "slice" && fields.length > 0) {
    addFieldDropdown = <AddFieldDropdown {...addFieldDropdownProps} />;
  } else if (zoneType === "customType") {
    addFieldDropdown = (
      <AddStaticFieldDropdown
        {...addFieldDropdownProps}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        zoneTypeFormat={zoneTypeFormat}
      />
    );
  }

  return (
    <>
      <ListHeader
        actions={
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          <>
            {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              fields.length > 0 && (
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
                </>
              )
            }
            {addFieldDropdown}
          </>
        }
      >
        {title}
      </ListHeader>
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
        fields.length === 0 && zoneType === "slice" ? (
          <ZoneEmptyState
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            zoneType={getResolvedZoneType(zoneType, zoneTypeFormat)}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            heading={emptyStateHeading}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            action={<AddFieldDropdown {...addFieldDropdownProps} />}
          />
        ) : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
        fields.length > 0 ? (
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
    </>
  );
};

Zone.propTypes = {
  isRepeatable: bool,
  title: string.isRequired,
  dataTip: string.isRequired,
  onSave: func.isRequired,
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
