import { Box } from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import ModalFormCard from "../../ModalFormCard";
import { InputBox } from "../components/InputBox";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { FormikErrors } from "formik";
import { selectAllCustomTypeLabels } from "@src/modules/availableCustomTypes";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { CustomTypeFormat } from "@slicemachine/manager";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";
import { useEffect, useState } from "react";

interface RenameCustomTypeModalProps {
  customType?: CustomType;
  format: CustomTypeFormat;
  onClose: () => void;
}

export const RenameCustomTypeModal: React.FC<RenameCustomTypeModalProps> = ({
  customType,
  format,
  onClose,
}) => {
  const customTypeName = customType?.label ?? "";
  const customTypeId = customType?.id ?? "";
  const { renameCustomType } = useSliceMachineActions();

  const [didSubmit, setDidSubmit] = useState(false);

  const handleOnSubmit = (values: { customTypeName: string }) => {
    renameCustomType(customTypeId, format, values.customTypeName);
    setDidSubmit(true);
  };

  const { customTypeLabels, isRenamingCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      customTypeLabels: selectAllCustomTypeLabels(store),
      isRenamingCustomType: isLoading(
        store,
        LoadingKeysEnum.RENAME_CUSTOM_TYPE
      ),
    })
  );

  useEffect(() => {
    if (!isRenamingCustomType && didSubmit) {
      onClose();
    }
  }, [didSubmit, isRenamingCustomType, onClose]);

  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];

  return (
    <ModalFormCard
      isOpen
      dataCy="rename-custom-type-modal"
      widthInPx="530px"
      formId={`rename-custom-type-modal-${customTypeId}`}
      close={onClose}
      buttonLabel="Rename"
      onSubmit={handleOnSubmit}
      initialValues={{
        customTypeName: customTypeName,
      }}
      isLoading={isRenamingCustomType}
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
