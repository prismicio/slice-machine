import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { CustomTypeFormat } from "@slicemachine/manager";
import { FormikErrors } from "formik";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Box } from "theme-ui";

import { renameCustomType } from "@/features/customTypes/actions/renameCustomType";
import { CUSTOM_TYPES_MESSAGES } from "@/features/customTypes/customTypesMessages";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { selectAllCustomTypeLabels } from "@/modules/availableCustomTypes";
import useSliceMachineActions from "@/modules/useSliceMachineActions";
import { SliceMachineStoreType } from "@/redux/type";

import ModalFormCard from "../../ModalFormCard";
import { InputBox } from "../components/InputBox";

interface RenameCustomTypeModalProps {
  isChangesLocal: boolean;
  customType: CustomType;
  format: CustomTypeFormat;
  onClose: () => void;
  setLocalCustomType?: (customType: CustomType) => void;
}

export const RenameCustomTypeModal: React.FC<RenameCustomTypeModalProps> = ({
  isChangesLocal,
  customType,
  format,
  onClose,
  setLocalCustomType,
}) => {
  const customTypeName = customType?.label ?? "";
  const customTypeId = customType?.id ?? "";
  const { renameCustomTypeSuccess } = useSliceMachineActions();
  const { syncChanges } = useAutoSync();

  const [isRenaming, setIsRenaming] = useState(false);

  const handleOnSubmit = async (values: { customTypeName: string }) => {
    setIsRenaming(true);
    if (isChangesLocal && setLocalCustomType) {
      setLocalCustomType({
        ...customType,
        label: values.customTypeName,
      });
    } else {
      await renameCustomType({
        model: customType,
        newLabel: values.customTypeName,
        onSuccess: (renamedCustomType) => {
          renameCustomTypeSuccess(renamedCustomType);
          syncChanges();
        },
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
      testId="rename-custom-type-modal"
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
            testId="custom-type-name-input"
          />
        </Box>
      )}
    </ModalFormCard>
  );
};
