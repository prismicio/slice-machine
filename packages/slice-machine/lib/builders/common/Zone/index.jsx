import { Button, ButtonGroup } from "@prismicio/editor-ui";
import { array, arrayOf, bool, func, object, shape, string } from "prop-types";
import { useState } from "react";
import { BaseStyles, Heading } from "theme-ui";

import { List, ListHeader } from "@src/components/List";

import SelectFieldTypeModal from "../SelectFieldTypeModal";
import NewField from "./Card/components/NewField";
import Card from "./Card";
import EmptyState from "./components/EmptyState";
import ZoneHeader from "./components/ZoneHeader";

const Zone = ({
  zoneType /* type of the zone: customType or slice */,
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
  dataCy,
  isRepeatableCustomType,
}) => {
  const isCustomType = zoneType === "customType";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const widgetsArrayWithCondUid = (() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
    const hasUid = !!Object.entries(poolOfFieldsToCheck).find(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      ([, { value }]) => value.type === "UID"
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

  const enterEditMode = (field) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    setEditModalData({ isOpen: true, field });
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
    <List>
      {isCustomType ? (
        <ListHeader
          actions={
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            fields.length > 0 ? (
              <ButtonGroup size="medium" variant="secondary">
                <Button
                  variant="secondary"
                  onClick={() => setShowHints(!showHints)}
                >
                  {showHints ? "Hide" : "Show"} code snippets
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => enterSelectMode()}
                  data-cy={`add-${
                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                    isRepeatable ? "Repeatable" : "Static"
                  }-field`}
                  startIcon="add"
                >
                  Add a new field
                </Button>
              </ButtonGroup>
            ) : undefined
          }
        >
          {title}
        </ListHeader>
      ) : (
        <BaseStyles>
          <ZoneHeader
            Heading={<Heading as="h6">{title}</Heading>}
            Actions={
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              fields.length > 0 ? (
                <ButtonGroup size="medium" variant="secondary">
                  <Button
                    variant="secondary"
                    onClick={() => setShowHints(!showHints)}
                  >
                    {showHints ? "Hide" : "Show"} code snippets
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => enterSelectMode()}
                    data-cy={`add-${
                      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                      isRepeatable ? "Repeatable" : "Static"
                    }-field`}
                    startIcon="add"
                  >
                    Add a new field
                  </Button>
                </ButtonGroup>
              ) : null
            }
          />
        </BaseStyles>
      )}
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
        fields.length === 0 && !newFieldData ? (
          <BaseStyles>
            <EmptyState
              onEnterSelectMode={() => enterSelectMode()}
              // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
              zoneName={isRepeatable ? "Repeatable" : "Static"}
            />
          </BaseStyles>
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
              dataCy={dataCy}
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
              sx={isCustomType ? { paddingInline: "16px !important" } : {}}
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
    </List>
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
    })
  ),
};

export default Zone;
