import { Box } from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import ModalFormCard from "../../ModalFormCard";
import { InputBox } from "../components/InputBox";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { FormikErrors } from "formik";
import { selectAllCustomTypeLabels } from "@src/modules/availableCustomTypes";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { CustomTypeFormat } from "@slicemachine/manager/*";
import { CUSTOM_TYPES_CONFIG } from "@src/features/customTypes/customTypesConfig";

interface RenameCustomTypeModalProps {
  customType?: CustomType;
  format: CustomTypeFormat;
}

export const RenameCustomTypeModal: React.FC<RenameCustomTypeModalProps> = ({
  customType,
  format,
}) => {
  const customTypeName = customType?.label ?? "";
  const customTypeId = customType?.id ?? "";
  const { renameCustomType, closeModals } = useSliceMachineActions();

  const handleOnSubmit = (values: { customTypeName: string }) => {
    renameCustomType(customTypeId, format, values.customTypeName);
  };
  const {
    isRenameCustomTypeModalOpen,
    customTypeLabels,
    isRenamingCustomType,
  } = useSelector((store: SliceMachineStoreType) => ({
    isRenameCustomTypeModalOpen: isModalOpen(
      store,
      ModalKeysEnum.RENAME_CUSTOM_TYPE
    ),
    customTypeLabels: selectAllCustomTypeLabels(store),
    isRenamingCustomType: isLoading(store, LoadingKeysEnum.RENAME_CUSTOM_TYPE),
  }));
  const customTypesConfig = CUSTOM_TYPES_CONFIG[format];

  return (
    <ModalFormCard
      dataCy="rename-custom-type-modal"
      isOpen={isRenameCustomTypeModalOpen}
      widthInPx="530px"
      formId={`rename-custom-type-modal-${customTypeId}`}
      close={closeModals}
      buttonLabel="Rename"
      onSubmit={handleOnSubmit}
      initialValues={{
        customTypeName: customTypeName,
      }}
      isLoading={isRenamingCustomType}
      content={{
        title: `Rename a ${customTypesConfig.name({
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
          errors.customTypeName = `${customTypesConfig.name({
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
            label={`${customTypesConfig.name({
              start: true,
              plural: false,
            })} Name`}
            placeholder={`A display name for the ${customTypesConfig.name({
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
