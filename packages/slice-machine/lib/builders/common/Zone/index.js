import React, { useState, Fragment } from "react";
import { array, arrayOf, bool, shape, string, object, func } from "prop-types";

import Card from "./Card";

import { Heading, Button } from "theme-ui";
import { FaPlus, FaCode } from "react-icons/fa";

import SelectFieldTypeModal from "../SelectFieldTypeModal";
import NewField from "./Card/components/NewField";

import ZoneHeader from "./components/ZoneHeader";
import EmptyState from "./components/EmptyState";

const Zone = ({
  mockConfig,
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
  getFieldMockConfig /* access mock configuration of given apiId */,
  renderHintBase /* render base (eg. path to slice) content for hints */,
  renderFieldAccessor /* render field accessor (eg. slice.primary.title) */,
  dataCy,
}) => {
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
    <Fragment>
      <ZoneHeader
        Heading={<Heading as="h6">{title}</Heading>}
        Actions={
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          fields.length ? (
            <Fragment>
              <Button
                variant="buttons.lightSmall"
                onClick={() => setShowHints(!showHints)}
              >
                <FaCode
                  style={{
                    marginRight: "8px",
                    position: "relative",
                    top: "2px",
                  }}
                />{" "}
                {showHints ? "Hide" : "Show"} code snippets
              </Button>
              <Button
                ml={2}
                variant="buttons.darkSmall"
                onClick={() => enterSelectMode()}
                data-cy="add-new-field"
              >
                <FaPlus
                  style={{
                    marginRight: "8px",
                    position: "relative",
                    top: "2px",
                  }}
                />
                Add a new Field
              </Button>
            </Fragment>
          ) : null
        }
      />
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        !fields.length && !newFieldData && (
          <EmptyState
            onEnterSelectMode={() => enterSelectMode()}
            zoneName={isRepeatable ? "Repeatable" : "Static"}
          />
        )
      }
      <Card
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        tabId={tabId}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        isRepeatable={isRepeatable}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        fields={fields}
        showHints={showHints}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        mockConfig={mockConfig}
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
        NewFieldC={() =>
          newFieldData && (
            <NewField
              {...newFieldData}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
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
      <EditModal
        data={editModalData}
        close={closeEditModal}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        onSave={onSave}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
        fields={poolOfFieldsToCheck}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        getFieldMockConfig={getFieldMockConfig}
      />
      <SelectFieldTypeModal
        data={selectModalData}
        close={closeSelectModal}
        onSelect={onSelectFieldType}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        widgetsArray={widgetsArrayWithCondUid}
      />
    </Fragment>
  );
};

Zone.propTypes = {
  isRepeatable: bool,
  mockConfig: object.isRequired,
  title: string.isRequired,
  dataTip: string.isRequired,
  onSave: func.isRequired,
  onSaveNewField: func.isRequired,
  onDragEnd: func.isRequired,
  onDeleteItem: func.isRequired,
  poolOfFieldsToCheck: arrayOf(shape({ key: string, value: object })),
  // how to access mock config for given key
  getFieldMockConfig: func.isRequired,
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
