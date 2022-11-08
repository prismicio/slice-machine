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
import { FrontEndCustomType } from "@src/modules/availableCustomTypes/types";

interface RenameCustomTypeModalProps {
  customType?: FrontEndCustomType;
}

export const RenameCustomTypeModal: React.FC<RenameCustomTypeModalProps> = ({
  customType,
}) => {
  const customTypeName = customType?.local.label ?? "";
  const customTypeId = customType?.local.id ?? "";

  const { renameCustomType, closeRenameCustomTypeModal } =
    useSliceMachineActions();

  const handleOnSubmit = (values: { customTypeName: string }) => {
    renameCustomType(customTypeId, values.customTypeName);
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

  return (
    <ModalFormCard
      dataCy="rename-custom-type-modal"
      isOpen={isRenameCustomTypeModalOpen}
      widthInPx="530px"
      formId={`rename-custom-type-modal-${customTypeId}`}
      close={closeRenameCustomTypeModal}
      buttonLabel="Rename"
      onSubmit={handleOnSubmit}
      initialValues={{
        customTypeName: customTypeName,
      }}
      isLoading={isRenamingCustomType}
      content={{ title: "Rename a custom type" }}
      validate={({ customTypeName: newName }) => {
        const errors: FormikErrors<{
          customTypeName: string;
        }> = {};

        if (!newName || !newName.length) {
          errors.customTypeName = "Cannot be empty.";
        }

        if (
          !errors.customTypeName &&
          customTypeLabels.includes(newName) &&
          customTypeName !== newName
        ) {
          errors.customTypeName = "Custom Type name is already taken.";
        }

        return Object.keys(errors).length > 0 ? errors : undefined;
      }}
    >
      {({ errors }) => (
        <Box>
          <InputBox
            name="customTypeName"
            label="Custom Type Name"
            placeholder="A display name for the Custom type"
            error={errors.customTypeName}
            dataCy="custom-type-name-input"
          />
        </Box>
      )}
    </ModalFormCard>
  );
};
