import Modal from "react-modal";
import { useSelector } from "react-redux";
import { Box, Button, Close, Flex, useThemeUI } from "theme-ui";
import * as yup from "yup";

import { useCardRadius } from "@/legacy/components/Card";
import Card from "@/legacy/components/Card/WithTabs";
import { Col, Flex as FlexGrid } from "@/legacy/components/Flex";
import ItemHeader from "@/legacy/components/ItemHeader";
import SliceMachineModal from "@/legacy/components/SliceMachineModal";
import {
  createFieldNameFromKey,
  createInitialValues,
} from "@/legacy/lib/forms";
import { DeprecatedMockConfigMessage } from "@/legacy/lib/models/common/DeprecatedMockConfigMessage";
import { hasLocal } from "@/legacy/lib/models/common/ModelData";
import { Widgets } from "@/legacy/lib/models/common/widgets";
import { removeProp } from "@/legacy/lib/utils";
import { selectAllCustomTypes } from "@/modules/availableCustomTypes";

import { findWidgetByConfigOrType } from "../../utils";
import WidgetFormField from "./Field";
import WidgetForm from "./Form";

if (process.env.NODE_ENV !== "test") {
  Modal.setAppElement("#__next");
}

const FORM_ID = "edit-modal-form";

const EditModal = ({ close, data, fields, onSave, zoneType }) => {
  const { theme } = useThemeUI();
  const localCustomTypes = useSelector(selectAllCustomTypes).filter(hasLocal);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
  if (!data.isOpen) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    field: [apiId, initialModelValues],
  } = data;

  const maybeWidget = findWidgetByConfigOrType(
    Widgets,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    initialModelValues.config,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    initialModelValues.type,
  );

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!maybeWidget) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
    return <div>{initialModelValues.type} not found</div>;
  }
  const {
    Meta: { icon: WidgetIcon },
    FormFields,
    Form: CustomForm,
    schema: widgetSchema,
  } = maybeWidget;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const initialConfig = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ...createInitialValues(removeProp(FormFields, "id")),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
    ...(maybeWidget.prepareInitialValues
      ? // eslint-disable-next-line
        maybeWidget.prepareInitialValues(
          localCustomTypes,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          initialModelValues.config,
        )
      : // eslint-disable-next-line
        initialModelValues.config),
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
  const { res: validatedSchema, err } = (() => {
    try {
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        res: widgetSchema.validateSync(
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            type: initialModelValues.type,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            config: initialConfig,
          },
          { stripUnknown: true },
        ),
      };
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { err: e };
    }
  })();

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (err) {
    console.error(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
      `[EditModal] Failed to validate field of type ${initialModelValues.type}.\n Please update model.json accordingly.`,
    );
    console.error(err);
  }

  const initialValues = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    id: apiId,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
    config: validatedSchema ? validatedSchema.config : initialConfig,
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const [idMatches, idMessage] = FormFields.id.validate.matches;
  const validationSchema = yup.object().shape({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-argument
    id: yup.string().matches(idMatches, idMessage).min(3).max(35).required(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    config: widgetSchema.fields.config,
  });

  const formId = `${FORM_ID}-${Math.random().toString()}`;

  return (
    <SliceMachineModal
      isOpen
      shouldCloseOnOverlayClick
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
      onRequestClose={close}
      contentLabel="Widget Form Modal"
    >
      <WidgetForm
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        apiId={apiId}
        formId={formId}
        initialValues={initialValues}
        validationSchema={validationSchema}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        FormFields={FormFields}
        onSave={({ newKey, value }) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
          const updatedValue = { ...initialModelValues, ...value };
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          onSave({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
            apiId,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            newKey,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value: updatedValue,
            updateMeta: {
              fieldIdChanged: { previousPath: [apiId], newPath: [newKey] },
            },
          });
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          close();
        }}
      >
        {(props) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
          const {
            values: {
              id,
              config: { label },
            },
            isValid,
            isSubmitting,
            initialValues,
          } = props;

          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          const fieldModelTabContent = CustomForm ? (
            <CustomForm
              key="field-model-tab-content"
              {...props}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              fields={fields}
            />
          ) : (
            <FlexGrid key="field-model-tab-content">
              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */}
              {Object.entries(FormFields).map(([key, field]) => (
                <Col key={key}>
                  <WidgetFormField
                    fieldName={createFieldNameFromKey(key)}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    formField={field}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    fields={fields}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    initialValues={initialValues}
                    autoFocus={apiId !== "" ? false : undefined}
                  />
                </Col>
              ))}
            </FlexGrid>
          );

          const tabs = ["Field Model"];
          const cardContent = [fieldModelTabContent];

          // Only display "Mock Data" tab for slice with the simulator fallback display, see DT-991
          if (zoneType === "slice") {
            const mockDataTabContent = (
              <Box key="mock-data-tab-content">
                <DeprecatedMockConfigMessage />
              </Box>
            );

            tabs.push("Mock Data");
            cardContent.push(mockDataTabContent);
          }

          return (
            <Card
              borderFooter
              footerSx={{ position: "sticky", bottom: 0, p: 0 }}
              tabs={tabs}
              Header={
                <CardHeader>
                  <ItemHeader
                    theme={theme}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/strict-boolean-expressions
                    text={label || id}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    WidgetIcon={WidgetIcon}
                  />
                  <Close // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
                    onClick={close}
                    type="button"
                  />
                </CardHeader>
              }
              Footer={
                <Flex
                  sx={{
                    position: "sticky",
                    bottom: 0,
                    alignItems: "space-between",
                    bg: "headSection",
                    p: 3,
                  }}
                >
                  <Box sx={{ ml: "auto" }} />
                  <Button
                    mr={2}
                    type="button"
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    onClick={close}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    form={formId}
                    type="submit"
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/strict-boolean-expressions
                    disabled={!isValid && isSubmitting}
                    sx={{
                      fontWeight: "400",
                      paddingBlock: "8px",
                      paddingInline: "16px",
                      fontSize: "14px",
                      borderRadius: "4px",
                    }}
                  >
                    Done
                  </Button>
                </Flex>
              }
            >
              {cardContent}
            </Card>
          );
        }}
      </WidgetForm>
    </SliceMachineModal>
  );
};

function CardHeader({ children }) {
  const radius = useCardRadius();
  return (
    <Flex
      sx={{
        position: "sticky",
        zIndex: 1,
        top: 0,
        p: 3,
        bg: "headSection",
        alignItems: "center",
        justifyContent: "space-between",
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
      }}
    >
      {children}
    </Flex>
  );
}

export default EditModal;
