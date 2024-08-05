import {
  Box,
  Button,
  Dialog,
  DialogActionButton,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogHeader,
  FormInput,
  Icon,
  Text,
} from "@prismicio/editor-ui";
import {
  Group,
  NestableWidget,
  UID,
} from "@prismicio/types-internal/lib/customtypes";
import { Formik } from "formik";
import { type FC, useState } from "react";
import type { AnyObjectSchema } from "yup";

import { updateField } from "@/domain/customType";
import { useCustomTypeState } from "@/features/customTypes/customTypesBuilder/CustomTypeProvider";
import {
  CustomTypes,
  type TabField,
  TabFieldsModel,
} from "@/legacy/lib/models/common/CustomType";
import { Widgets } from "@/legacy/lib/models/common/widgets";
import { type Widget } from "@/legacy/lib/models/common/widgets/Widget";

interface UIDEditorProps {
  field: { key: string; value: TabField };
}

export const UIDEditor: FC<UIDEditorProps> = ({ field }) => {
  const [isOpen, setOpen] = useState(false);
  const [isSaving, setSaving] = useState(false);

  const { customType, setCustomType } = useCustomTypeState();
  const customTypeSM = CustomTypes.toSM(customType);

  const sectionId =
    customTypeSM.tabs.find((tab) => {
      return tab.value.find((f) => f.key === field.key);
    })?.key ?? "";

  const saveUIDLabel = (label: string) => {
    const widget: Widget<TabField, AnyObjectSchema> = Widgets["UID"];
    const newValue = widget.create(label);

    const newField: NestableWidget | UID | Group =
      TabFieldsModel.fromSM(newValue);

    const newCustomType = updateField({
      customType,
      previousFieldId: field.key,
      newFieldId: field.key,
      newField,
      sectionId,
    });

    setCustomType(newCustomType);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setOpen}
      size={{ width: 448, height: 248 }}
      trigger={
        <Button
          color="grey"
          textColor="placeholder"
          startIcon="language"
          sx={{ marginInline: "auto" }}
        >
          :uid
        </Button>
      }
    >
      <DialogHeader title="Update UID label" />
      <DialogContent>
        <Formik
          initialValues={{ label: field?.value?.config?.label ?? "" }}
          validate={(values) => {
            const errors: Record<string, string> = {};
            if (!values.label) {
              errors.label = "This field is required";
            }
            return errors;
          }}
          onSubmit={(values) => {
            setSaving(true);

            saveUIDLabel(values.label);

            setSaving(false);
            setOpen(false);
          }}
        >
          {(formik) => (
            <form onSubmit={formik.handleSubmit}>
              <Box flexDirection="column" padding={16}>
                <FormInput
                  type="text"
                  label="Label *"
                  placeholder="UID"
                  value={formik.values.label}
                  onValueChange={(value) =>
                    void formik.setFieldValue("label", value)
                  }
                  error={typeof formik.errors.label === "string"}
                />
                <Box alignItems="center" gap={4} padding={{ top: 4 }}>
                  {typeof formik.errors.label === "string" ? (
                    <>
                      <Icon name="alert" color="tomato11" size="small" />
                      <Text color="tomato11">{formik.errors.label}</Text>
                    </>
                  ) : (
                    <Text color="grey11">A label for the UID</Text>
                  )}
                </Box>
              </Box>
              <DialogActions>
                <DialogCancelButton size="medium" disabled={isSaving} />
                <DialogActionButton
                  size="medium"
                  loading={isSaving}
                  onClick={() => void formik.submitForm()}
                  disabled={!formik.isValid}
                >
                  Save
                </DialogActionButton>
              </DialogActions>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
