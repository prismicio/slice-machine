import { Box } from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import ModalFormCard from "../../ModalFormCard";
import { InputBox } from "../components/InputBox";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";

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
    closeRenameCustomTypeModal();
  };
  const { isCreateCustomTypeModalOpen } = useSelector(
    (store: SliceMachineStoreType) => ({
      isCreateCustomTypeModalOpen: isModalOpen(
        store,
        ModalKeysEnum.RENAME_CUSTOM_TYPE
      ),
    })
  );

  return (
    <ModalFormCard
      dataCy="rename-custom-type-modal"
      isOpen={isCreateCustomTypeModalOpen}
      widthInPx="530px"
      formId={`rename-custom-type-modal-${customTypeId}`}
      close={closeRenameCustomTypeModal}
      buttonLabel="Rename"
      onSubmit={handleOnSubmit}
      initialValues={{
        customTypeName: customTypeName,
      }}
      content={{ title: "Rename a custom type" }}
    >
      {({ touched, errors }) => (
        <Box>
          <InputBox
            name="customTypeName"
            label="Custom Type Name"
            placeholder="MyCustomType"
            error={touched.customTypeName ? errors.customTypeName : undefined}
            dataCy="custom-type-name-input"
          />
        </Box>
      )}
    </ModalFormCard>
  );
};
