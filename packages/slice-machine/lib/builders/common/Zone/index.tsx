import React, { useState, Fragment, FC } from "react";

import Card from "./Card";

import { FaPlus, FaCode } from "react-icons/fa";

import SelectFieldTypeModal from "../SelectFieldTypeModal";
import NewField, { FormFieldValues } from "./Card/components/NewField";

import EmptyState from "./components/EmptyState";
import { ListHeader } from "@src/components/List";
import { TabField, TabFields } from "@lib/models/common/CustomType";
import type { PoolOfFields } from "@src/modules/selectedCustomType/types";
import type { CtBuilderArrayTypes } from "@lib/models/common/widgets/ctBuilderArray";
import type { SliceBuilderArrayTypes } from "@lib/models/common/widgets/sliceBuilderArray";
import { DropResult } from "react-beautiful-dnd";
import { FieldsSM } from "@lib/models/common/Fields";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes";
import { Button, ButtonGroup } from "@prismicio/editor-ui";
import ZoneHeader from "./components/ZoneHeader";

import { Heading, Button as ThemeUIButton } from "theme-ui";

type ModalData = {
  isOpen: boolean;
  field?: TabField;
};

type SaveTabFieldFn = (args: {
  apiId: string;
  newKey: string;
  value: TabField;
}) => void;

type SaveNestableWidetFn = (args: {
  apiId: string;
  newKey: string;
  value: NestableWidget;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockValue?: any;
}) => void;

type OnSaveFn = SaveTabFieldFn | SaveNestableWidetFn;

type ZoneType = "customType" | "slice";

type ZoneProps = {
  zoneType: ZoneType;
  tabId?: string | undefined;
  title: string;
  dataTip?: string;
  onSave: OnSaveFn;
  fields?: TabFields | FieldsSM;
  poolOfFieldsToCheck?: PoolOfFields;
  widgetsArray: CtBuilderArrayTypes | SliceBuilderArrayTypes;
  isRepeatable?: boolean | undefined;
  onDeleteItem: (fieldId: string) => void;
  onSaveNewField: (values: FormFieldValues) => void;
  onDragEnd: (result: DropResult) => void;
  renderHintBase: (args: { item: { key: string } }) => string;
  renderFieldAccessor: (key: string) => string;
  dataCy: string;
  isRepeatableCustomType?: boolean | undefined;
  EditModal: (props: {
    // typeof packages/slice-machine/lib/builders/common/EditModal/index.jsx
    data: ModalData;
    close: () => void;
    onSave: OnSaveFn;
    fields: PoolOfFields | undefined;
    zoneType: ZoneType;
  }) => JSX.Element | null;
  showHints?: boolean;
};

const Zone: FC<ZoneProps> = ({
  zoneType /* type of the zone: customType or slice */,
  tabId,
  title /* text info to display in Card Header */,
  fields = [] /* widgets registered in the zone */,
  poolOfFieldsToCheck /* if you need to check unicity of fields from other zones */,
  widgetsArray /* Array of available widget fields */,
  isRepeatable /* should we wrap hints in map ? */,
  onDeleteItem /* user clicked on "Delete field" */,
  onSaveNewField /* user clicked on "Save" (NewField) */,
  onDragEnd /* user dragged item to an end location */,
  EditModal /* temp */,
  onSave /* user clicked on "Save" (EditModal) */,
  // dataTip /* text info to display as tip */,
  renderHintBase /* render base (eg. path to slice) content for hints */,
  renderFieldAccessor /* render field accessor (eg. slice.primary.title) */,
  dataCy,
  isRepeatableCustomType,
}) => {
  const widgetsArrayWithCondUid = (() => {
    const hasUid =
      poolOfFieldsToCheck &&
      !!Object.entries(poolOfFieldsToCheck).find(
        ([, { value }]) => value.type === "UID"
      );
    return hasUid === true
      ? widgetsArray.filter(({ TYPE_NAME }) => TYPE_NAME !== "UID")
      : widgetsArray;
  })();

  const [showHints, setShowHints] = useState<boolean>(false);
  const [editModalData, setEditModalData] = useState<ModalData>({
    isOpen: false,
  });
  const [selectModalData, setSelectModalData] = useState<ModalData>({
    isOpen: false,
  });
  const [newFieldData, setNewFieldData] = useState<{
    widgetTypeName: string;
    fields: TabFields;
  } | null>(null);

  const enterEditMode = (field: TabField) => {
    setEditModalData({ isOpen: true, field });
  };
  const enterSelectMode = () => {
    setSelectModalData({ isOpen: true });
  };

  const closeEditModal = () => {
    setEditModalData({ isOpen: false });
  };
  const closeSelectModal = () => setSelectModalData({ isOpen: false });

  const onSelectFieldType = (widgetTypeName: string) => {
    setNewFieldData({ widgetTypeName, fields });
    setSelectModalData({ isOpen: false });
  };

  const onCancelNewField = () => setNewFieldData(null);

  return (
    <Fragment>
      {zoneType !== "slice" ? (
        <ListHeader
          actions={
            fields.length ? (
              <ButtonGroup size="small">
                <Button onClick={() => setShowHints(!showHints)}>
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
                  variant="tertiary"
                  onClick={() => enterSelectMode()}
                  data-cy={`add-${
                    isRepeatable === true ? "Repeatable" : "Static"
                  }-field`}
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
              </ButtonGroup>
            ) : null
          }
        >
          {title}
        </ListHeader>
      ) : (
        <ZoneHeader
          Heading={<Heading as="h6">{title}</Heading>}
          Actions={
            fields.length ? (
              <Fragment>
                <ThemeUIButton
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
                </ThemeUIButton>
                <ThemeUIButton
                  ml={2}
                  variant="buttons.darkSmall"
                  onClick={() => enterSelectMode()}
                  data-cy={`add-${
                    isRepeatable === true ? "Repeatable" : "Static"
                  }-field`}
                >
                  <FaPlus
                    style={{
                      marginRight: "8px",
                      position: "relative",
                      top: "2px",
                    }}
                  />
                  Add a new Field
                </ThemeUIButton>
              </Fragment>
            ) : null
          }
        />
      )}
      {fields.length === 0 && !newFieldData && (
        <EmptyState
          onEnterSelectMode={() => enterSelectMode()}
          zoneName={isRepeatable === true ? "Repeatable" : "Static"}
        />
      )}
      <Card
        isSliceBuilder={zoneType === "slice"}
        tabId={tabId}
        isRepeatable={isRepeatable}
        fields={fields}
        showHints={showHints}
        title={title}
        renderFieldAccessor={renderFieldAccessor}
        renderHintBase={renderHintBase}
        enterEditMode={enterEditMode}
        enterSelectMode={enterSelectMode}
        onDragEnd={onDragEnd}
        onDeleteItem={onDeleteItem}
        dataCy={dataCy}
        isRepeatableCustomType={isRepeatableCustomType}
        newField={
          newFieldData && (
            <NewField
              {...newFieldData}
              fields={poolOfFieldsToCheck ? [...poolOfFieldsToCheck] : fields}
              onSave={(...args) => {
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
        onSave={onSave}
        fields={poolOfFieldsToCheck}
        zoneType={zoneType}
      />
      <SelectFieldTypeModal
        data={selectModalData}
        close={closeSelectModal}
        onSelect={onSelectFieldType}
        widgetsArray={widgetsArrayWithCondUid}
      />
    </Fragment>
  );
};

export default Zone;
