import type { CustomTypeFormat } from "@slicemachine/manager";
import { FormikErrors } from "formik";
import { useRouter } from "next/router";
import { SetStateAction, useState } from "react";
import { useSelector } from "react-redux";
import { Box } from "theme-ui";

import { getFormat } from "@/domain/customType";
import {
  createCustomType,
  CustomTypeOrigin,
} from "@/features/customTypes/actions/createCustomType";
import { CUSTOM_TYPES_CONFIG } from "@/features/customTypes/customTypesConfig";
import { CUSTOM_TYPES_MESSAGES } from "@/features/customTypes/customTypesMessages";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import ModalFormCard from "@/legacy/components/ModalFormCard";
import { API_ID_REGEX } from "@/legacy/lib/consts";
import { slugify } from "@/legacy/lib/utils/str";
import {
  selectAllCustomTypeIds,
  selectAllCustomTypeLabels,
} from "@/modules/availableCustomTypes";
import useSliceMachineActions from "@/modules/useSliceMachineActions";
import { SliceMachineStoreType } from "@/redux/type";

import { InputBox } from "../components/InputBox";
import { SelectRepeatable } from "../components/SelectRepeatable";

interface FormValues {
  id: string;
  label: string;
  repeatable: boolean;
}

type CreateCustomTypeModalProps = {
  format: CustomTypeFormat;
  isCreating: boolean;
  isOpen: boolean;
  origin?: CustomTypeOrigin;
  onCreateChange: (isCreating: boolean) => void;
  onOpenChange: (isOpen: boolean) => void;
};

export const CreateCustomTypeModal: React.FC<CreateCustomTypeModalProps> = ({
  format,
  isCreating,
  isOpen,
  origin = "table",
  onCreateChange,
  onOpenChange,
}) => {
  const { createCustomTypeSuccess } = useSliceMachineActions();

  const { customTypeIds, customTypeLabels } = useSelector(
    (store: SliceMachineStoreType) => ({
      customTypeIds: selectAllCustomTypeIds(store),
      customTypeLabels: selectAllCustomTypeLabels(store),
    }),
  );
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];
  const [isIdFieldPristine, setIsIdFieldPristine] = useState(true);
  const { syncChanges } = useAutoSync();
  const router = useRouter();

  const onSubmit = async ({ id, label, repeatable }: FormValues) => {
    onCreateChange(true);

    await createCustomType({
      format,
      id,
      label,
      origin,
      repeatable,
      onSuccess: async (newCustomType) => {
        createCustomTypeSuccess(newCustomType);

        const format = getFormat(newCustomType);
        const customTypesConfig = CUSTOM_TYPES_CONFIG[format];

        setIsIdFieldPristine(true);

        await router.push({
          pathname: customTypesConfig.getBuilderPagePathname(id),
          query:
            newCustomType.format === "page"
              ? {
                  newPageType: true,
                }
              : undefined,
        });

        syncChanges();
      },
    });

    onCreateChange(false);
    onOpenChange(false);
  };

  const handleLabelChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    values: FormValues,
    setValues: (
      values: SetStateAction<FormValues>,
      shouldValidate?: boolean,
    ) => void,
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
      shouldValidate?: boolean,
    ) => Promise<unknown>,
  ) => {
    void setFieldValue("id", e.target.value);
    setIsIdFieldPristine(false);
  };

  return (
    <ModalFormCard
      testId="create-ct-modal"
      isOpen={isOpen}
      widthInPx="530px"
      formId="create-custom-type"
      buttonLabel={"Create"}
      close={() => {
        onOpenChange(false);
        setIsIdFieldPristine(true);
      }}
      onSubmit={(values) => {
        void onSubmit(values);
      }}
      isLoading={isCreating}
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
            testId="ct-name-input"
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
            testId="ct-id-input"
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
