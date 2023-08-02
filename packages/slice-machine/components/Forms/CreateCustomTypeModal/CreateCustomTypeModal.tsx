import { SetStateAction, useState } from "react";
import { Box } from "theme-ui";
import { FormikErrors } from "formik";
import { useSelector } from "react-redux";

import ModalFormCard from "@components/ModalFormCard";
import { InputBox } from "../components/InputBox";
import { SelectRepeatable } from "../components/SelectRepeatable";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  selectAllCustomTypeIds,
  selectAllCustomTypeLabels,
} from "@src/modules/availableCustomTypes";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { telemetry } from "@src/apiClient";
import { slugify } from "@lib/utils/str";
import { API_ID_REGEX } from "@lib/consts";
import type { CustomTypeFormat } from "@slicemachine/manager";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";

interface FormValues {
  id: string;
  label: string;
  repeatable: boolean;
}

type CreateCustomTypeModalProps = {
  format: CustomTypeFormat;
};

export const CreateCustomTypeModal: React.FC<CreateCustomTypeModalProps> = ({
  format,
}) => {
  const { createCustomType, closeModals } = useSliceMachineActions();

  const {
    customTypeIds,
    isCreateCustomTypeModalOpen,
    isCreatingCustomType,
    customTypeLabels,
  } = useSelector((store: SliceMachineStoreType) => ({
    customTypeIds: selectAllCustomTypeIds(store),
    customTypeLabels: selectAllCustomTypeLabels(store),
    isCreateCustomTypeModalOpen: isModalOpen(
      store,
      ModalKeysEnum.CREATE_CUSTOM_TYPE
    ),
    isCreatingCustomType: isLoading(store, LoadingKeysEnum.CREATE_CUSTOM_TYPE),
  }));
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];
  const [isIdFieldPristine, setIsIdFieldPristine] = useState(true);

  const createCustomTypeAndTrack = ({ id, label, repeatable }: FormValues) => {
    const name = label || id;

    void telemetry.track({
      event: "custom-type:created",
      id,
      name,
      format,
      type: repeatable ? "repeatable" : "single",
    });
    createCustomType(id, name, repeatable, format);
    closeModals();
    setIsIdFieldPristine(true);
  };

  const handleLabelChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    values: FormValues,
    setValues: (
      values: SetStateAction<FormValues>,
      shouldValidate?: boolean
    ) => void
  ) => {
    if (isIdFieldPristine) {
      setValues({
        ...values,
        label: e.target.value,
        id: slugify(e.target.value),
      });
    } else {
      setValues({ ...values, label: e.target.value });
    }
  };

  const handleIdChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (
      field: string,
      value: string,
      shouldValidate?: boolean
    ) => Promise<unknown>
  ) => {
    void setFieldValue("id", e.target.value);
    setIsIdFieldPristine(false);
  };

  return (
    <ModalFormCard
      dataCy="create-ct-modal"
      isOpen={isCreateCustomTypeModalOpen}
      widthInPx="530px"
      formId="create-custom-type"
      buttonLabel={"Create"}
      close={() => {
        closeModals();
        setIsIdFieldPristine(true);
      }}
      onSubmit={createCustomTypeAndTrack}
      isLoading={isCreatingCustomType}
      initialValues={{
        repeatable: true,
        id: "",
        label: "",
      }}
      validate={({ id, label }) => {
        const errors: FormikErrors<{
          repeatable: boolean;
          id: string;
          label: string;
        }> = {};

        if (!label || !label.length) {
          errors.label = "Cannot be empty.";
        }

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!errors.label && customTypeLabels.includes(label)) {
          errors.label = `${customTypesMessages.name({
            start: true,
            plural: false,
          })} name is already taken.`;
        }

        if (!id || !id.length) {
          errors.id = "ID cannot be empty.";
        }

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!errors.id && id && !API_ID_REGEX.exec(id)) {
          errors.id = "Invalid id: No special characters allowed.";
        }
        if (
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          !errors.id &&
          id &&
          customTypeIds
            .map((customTypeId) => customTypeId.toLowerCase())
            .includes(id)
        ) {
          errors.id = `ID "${id}" exists already.`;
        }

        return Object.keys(errors).length > 0 ? errors : undefined;
      }}
      content={{
        title: `Create a new ${customTypesMessages.name({
          start: false,
          plural: false,
        })}`,
      }}
    >
      {({ errors, setValues, setFieldValue, values, touched }) => (
        <Box>
          <SelectRepeatable format={format} />
          <InputBox
            name="label"
            label={`${customTypesMessages.name({
              start: true,
              plural: false,
            })} Name`}
            dataCy="ct-name-input"
            placeholder={`A display name for the ${customTypesMessages.name({
              start: false,
              plural: false,
            })}`}
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            error={touched.label ? errors.label : undefined}
            onChange={(e) => handleLabelChange(e, values, setValues)}
          />
          <InputBox
            name="id"
            dataCy="ct-id-input"
            label={`${customTypesMessages.name({
              start: true,
              plural: false,
            })} ID`}
            placeholder={customTypesMessages.inputPlaceholder}
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            error={touched.id ? errors.id : undefined}
            onChange={(e) => handleIdChange(e, setFieldValue)}
          />
        </Box>
      )}
    </ModalFormCard>
  );
};
