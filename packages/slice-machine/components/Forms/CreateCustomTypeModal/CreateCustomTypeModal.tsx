import { SetStateAction, useState } from "react";
import { Box } from "theme-ui";

import ModalFormCard from "@components/ModalFormCard";
import { InputBox } from "../components/InputBox";
import { SelectRepeatable } from "../components/SelectRepeatable";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  selectAllCustomTypeIds,
  selectAllCustomTypeLabels,
} from "@src/modules/availableCustomTypes";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { FormikErrors } from "formik";

import { telemetry } from "@src/apiClient";
import { slugify } from "@lib/utils/str";
import { API_ID_REGEX } from "@lib/consts";

interface FormValues {
  id: string;
  label: string;
  repeatable: boolean;
}

export const CreateCustomTypeModal: React.FC = () => {
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

  const [isIdFieldPristine, setIsIdFieldPristine] = useState(true);

  const createCustomTypeAndTrack = ({ id, label, repeatable }: FormValues) => {
    const name = label || id;

    void telemetry.track({
      event: "custom-type:created",
      id,
      name,
      type: repeatable ? "repeatable" : "single",
    });
    createCustomType(id, name, repeatable);
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
    ) => void
  ) => {
    setFieldValue("id", e.target.value);
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

        if (!errors.label && customTypeLabels.includes(label)) {
          errors.label = "Custom Type name is already taken.";
        }

        if (!id || !id.length) {
          errors.id = "ID cannot be empty.";
        }

        if (!errors.id && id && !API_ID_REGEX.exec(id)) {
          errors.id = "Invalid id: No special characters allowed.";
        }
        if (
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
        title: "Create a new custom type",
      }}
    >
      {({ errors, setValues, setFieldValue, values, touched }) => (
        <Box>
          <SelectRepeatable />
          <InputBox
            name="label"
            label="Custom Type Name"
            dataCy="ct-name-input"
            placeholder="A display name for the Custom type"
            error={touched.label ? errors.label : undefined}
            onChange={(e) => handleLabelChange(e, values, setValues)}
          />
          <InputBox
            name="id"
            dataCy="ct-id-input"
            label="Custom Type ID"
            placeholder="ID to query the Custom Type in the API (e.g. 'BlogPost')"
            error={touched.id ? errors.id : undefined}
            onChange={(e) => handleIdChange(e, setFieldValue)}
          />
        </Box>
      )}
    </ModalFormCard>
  );
};
