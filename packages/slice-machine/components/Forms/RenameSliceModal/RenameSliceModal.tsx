import { Box } from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import ModalFormCard from "../../ModalFormCard";
import { InputBox } from "../components/InputBox";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { getLibraries, getRemoteSlices } from "@src/modules/slices";
import { SliceModalValues } from "../formsTypes";
import { validateSliceModalValues } from "../formsValidator";

interface RenameSliceModalProps {
  sliceName: string;
  sliceId: string;
  libName: string;
}

export const RenameSliceModal: React.FC<RenameSliceModalProps> = ({
  sliceName,
  sliceId,
  libName,
}) => {
  const { renameSlice, closeModals } = useSliceMachineActions();
  const { isRenameSliceModalOpen, localLibs, remoteLibs } = useSelector(
    (store: SliceMachineStoreType) => ({
      isRenameSliceModalOpen: isModalOpen(store, ModalKeysEnum.RENAME_SLICE),
      localLibs: getLibraries(store),
      remoteLibs: getRemoteSlices(store),
    })
  );

  const handleOnSubmit = (values: SliceModalValues) => {
    renameSlice(libName, sliceId, values.sliceName);
  };

  return (
    <ModalFormCard<SliceModalValues>
      dataCy="rename-slice-modal"
      isOpen={isRenameSliceModalOpen}
      widthInPx="530px"
      formId={`rename-slice-modal-${sliceId}`}
      close={closeModals}
      buttonLabel="Rename"
      onSubmit={handleOnSubmit}
      initialValues={{
        sliceName: sliceName,
      }}
      content={{
        title: "Rename a slice",
      }}
      validate={(values) =>
        validateSliceModalValues(values, localLibs, remoteLibs)
      }
    >
      {({ touched, errors }) => (
        <Box>
          <InputBox
            name="sliceName"
            label="Slice Name"
            data-cy="slice-name-input"
            placeholder="Pascalised Slice API ID (e.g. TextBlock)"
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            error={touched.sliceName ? errors.sliceName : undefined}
            dataCy="slice-name-input"
          />
        </Box>
      )}
    </ModalFormCard>
  );
};
