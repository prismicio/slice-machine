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

interface RenameCustomTypeModalProps {
  customTypeName: string;
  customTypeId: string;
}

export const RenameCustomTypeModal: React.FC<RenameCustomTypeModalProps> = ({
  customTypeName,
  customTypeId,
}) => {
  const { renameCustomType, closeRenameCustomTypeModal } =
    useSliceMachineActions();

  const handleOnSubmit = (values: { customTypeName: string }) => {
    renameCustomType(customTypeId, values.customTypeName);
  };
  const { isRenameCustomTypeModalOpen, customTypeLabels } = useSelector(
    (store: SliceMachineStoreType) => ({
      isRenameCustomTypeModalOpen: isModalOpen(
        store,
        ModalKeysEnum.RENAME_CUSTOM_TYPE
      ),
      customTypeLabels: selectAllCustomTypeLabels(store),
    })
  );

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
            placeholder="MyCustomType"
            error={errors.customTypeName}
            dataCy="custom-type-name-input"
          />
        </Box>
      )}
    </ModalFormCard>
  );
};
