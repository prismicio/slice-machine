import Modal from "react-modal";
import SliceMachineModal from "@components/SliceMachineModal";

import { Box, Close, Flex, Button, useThemeUI } from "theme-ui";

import * as yup from "yup";
import * as Widgets from "@lib/models/common/widgets/withGroup";

import { createInitialValues, createFieldNameFromKey } from "@lib/forms";

import { MockConfigKey } from "@lib/consts";

import Card from "@components/Card/WithTabs";
import ItemHeader from "@components/ItemHeader";
import { Flex as FlexGrid, Col } from "@components/Flex";

import WidgetForm from "./Form";
import WidgetFormField from "./Field";

import { findWidgetByConfigOrType } from "../../utils";
import { removeProp } from "@lib/utils";
import { deepMerge } from "@lib/utils/obj";

if (process.env.NODE_ENV !== "test") {
  Modal.setAppElement("#__next");
}

const FORM_ID = "edit-modal-form";

const EditModal = ({ close, data, fields, onSave, getFieldMockConfig }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!data.isOpen) {
    return null;
  }
  const { theme } = useThemeUI();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    field: [apiId, initialModelValues],
  } = data;

  const maybeWidget = findWidgetByConfigOrType(
    Widgets,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    initialModelValues.config,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    initialModelValues.type
  );

  if (!maybeWidget) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
    return <div>{initialModelValues.type} not found</div>;
  }
  const {
    Meta: { icon: WidgetIcon },
    FormFields,
    MockConfigForm,
    Form: CustomForm,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    schema: widgetSchema,
  } = maybeWidget;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const initialConfig = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ...createInitialValues(removeProp(FormFields, "id")),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    ...initialModelValues.config,
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
          { stripUnknown: true }
        ),
      };
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { err: e };
    }
  })();

  if (err) {
    console.error(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
      `[EditModal] Failed to validate field of type ${initialModelValues.type}.\n Please update model.json accordingly.`
    );
    console.error(err);
  }

  const initialValues = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    id: apiId,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    config: validatedSchema ? validatedSchema.config : initialConfig,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    [MockConfigKey]: deepMerge(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      MockConfigForm?.initialValues || {},
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      getFieldMockConfig({ apiId }) || {}
    ),
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
        onSave={({ newKey, value }, mockValue) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          const maybeUpdatedMockValue =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            MockConfigForm?.onSave && mockValue && Object.keys(mockValue).length
              ? // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                MockConfigForm.onSave(mockValue, value)
              : mockValue;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const definitiveMockValue = (() => {
            if (
              maybeUpdatedMockValue &&
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              Object.keys(maybeUpdatedMockValue).length &&
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
              !!Object.entries(maybeUpdatedMockValue).find(
                ([, v]) => v !== null
              )
            ) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return maybeUpdatedMockValue;
            }
            return null;
          })();

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const updatedValue = {
            ...initialModelValues,
            ...value,
          };

          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          onSave({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
            apiId,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            newKey,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value: updatedValue,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            mockValue: definitiveMockValue,
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

          return (
            <Card
              borderFooter
              footerSx={{ p: 0, mb: 5 }}
              tabs={["Field Model", "Mock config"]}
              Header={({ radius }) => (
                <Flex
                  sx={{
                    p: 3,
                    bg: "headSection",
                    alignItems: "center",
                    justifyContent: "space-between",
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
                    borderTopLeftRadius: radius,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    borderTopRightRadius: radius,
                  }}
                >
                  <ItemHeader
                    theme={theme}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    text={label || id}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    WidgetIcon={WidgetIcon}
                  />
                  <Close // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
                    onClick={close}
                    type="button"
                  />
                </Flex>
              )}
              Footer={
                <Flex
                  sx={{ alignItems: "space-between", bg: "headSection", p: 3 }}
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
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    disabled={!isValid && isSubmitting}
                  >
                    Save
                  </Button>
                </Flex>
              }
            >
              {CustomForm ? (
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                <CustomForm {...props} fields={fields} />
              ) : (
                <FlexGrid>
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
                      />
                    </Col>
                  ))}
                </FlexGrid>
              )}

              <Box>
                {MockConfigForm ? (
                  <Box>
                    <MockConfigForm // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      initialValues={initialValues}
                    />
                  </Box>
                ) : (
                  <p>Mock data for this field is not yet available.</p>
                )}
              </Box>
            </Card>
          );
        }}
      </WidgetForm>
    </SliceMachineModal>
  );
};

export default EditModal;
