import { useState } from "react";
import { Box } from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import ModalFormCard from "../../ModalFormCard";
import { InputBox } from "../components/InputBox";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { FormikErrors } from "formik";
import { selectAllCustomTypeLabels } from "@src/modules/availableCustomTypes";

import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { CustomTypeFormat } from "@slicemachine/manager";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";

import { renameCustomType } from "@src/features/customTypes/actions/renameCustomType";

interface RenameCustomTypeModalProps {
  isChangesLocal: boolean;
  customType: CustomType;
  format: CustomTypeFormat;
  onClose: () => void;
}

export const RenameCustomTypeModal: React.FC<RenameCustomTypeModalProps> = ({
  isChangesLocal,
  customType,
  format,
  onClose,
}) => {
  const customTypeName = customType?.label ?? "";
  const customTypeId = customType?.id ?? "";
  const { renameAvailableCustomTypeSuccess, renameSelectedCustomType } =
    useSliceMachineActions();

  const [isRenaming, setIsRenaming] = useState(false);

  const handleOnSubmit = async (values: { customTypeName: string }) => {
    setIsRenaming(true);
    if (isChangesLocal) {
      renameSelectedCustomType(values.customTypeName);
    } else {
      await renameCustomType({
        model: customType,
        newLabel: values.customTypeName,
        onSuccess: renameAvailableCustomTypeSuccess,
      });
    }
    setIsRenaming(false);
    onClose();
  };

  const { customTypeLabels } = useSelector((store: SliceMachineStoreType) => ({
    customTypeLabels: selectAllCustomTypeLabels(store),
  }));

  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];

  return (
    <ModalFormCard
      isOpen
      dataCy="rename-custom-type-modal"
      widthInPx="530px"
      formId={`rename-custom-type-modal-${customTypeId}`}
      buttonLabel="Rename"
      close={onClose}
      onSubmit={(values) => void handleOnSubmit(values)}
      initialValues={{
        customTypeName: customTypeName,
      }}
      isLoading={isRenaming}
      content={{
        title: `Rename a ${customTypesMessages.name({
          start: false,
          plural: false,
        })}`,
      }}
      validate={({ customTypeName: newName }) => {
        const errors: FormikErrors<{
          customTypeName: string;
        }> = {};

        if (!newName || !newName.length) {
          errors.customTypeName = "Cannot be empty.";
        }

        if (
          errors.customTypeName != undefined &&
          customTypeLabels.includes(newName) &&
          customTypeName !== newName
        ) {
          errors.customTypeName = `${customTypesMessages.name({
            start: true,
            plural: false,
          })} name is already taken.`;
        }

        return Object.keys(errors).length > 0 ? errors : undefined;
      }}
    >
      {({ errors }) => (
        <Box>
          <InputBox
            name="customTypeName"
            label={`${customTypesMessages.name({
              start: true,
              plural: false,
            })} Name`}
            placeholder={`A display name for the ${customTypesMessages.name({
              start: false,
              plural: false,
            })}`}
            error={errors.customTypeName}
            dataCy="custom-type-name-input"
          />
        </Box>
      )}
    </ModalFormCard>
  );
};
