import { useSelector } from "react-redux";
import { Box } from "theme-ui";

import { renameSlice } from "@/features/slices/actions/renameSlice";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { getLibraries, getRemoteSlices } from "@/modules/slices";
import useSliceMachineActions from "@/modules/useSliceMachineActions";
import { SliceMachineStoreType } from "@/redux/type";

import ModalFormCard from "../../ModalFormCard";
import { InputBox } from "../components/InputBox";
import { SliceModalValues } from "../formsTypes";
import { validateSliceModalValues } from "../formsValidator";

interface RenameSliceModalProps {
  isOpen: boolean;
  slice?: ComponentUI;
  onClose: () => void;
}

export const RenameSliceModal: React.FC<RenameSliceModalProps> = ({
  slice,
  isOpen,
  onClose,
}) => {
  const { renameSliceSuccess } = useSliceMachineActions();
  const { syncChanges } = useAutoSync();
  const { localLibs, remoteLibs } = useSelector(
    (store: SliceMachineStoreType) => ({
      localLibs: getLibraries(store),
      remoteLibs: getRemoteSlices(store),
    }),
  );
  const initialSliceName = slice?.model.name ?? "";

  const handleOnSubmit = async (values: SliceModalValues) => {
    if (slice) {
      await renameSlice({
        slice,
        newSliceName: values.sliceName,
        onSuccess: (renamedSlice) => {
          renameSliceSuccess(renamedSlice.from, renamedSlice.model);
          syncChanges();
        },
      });

      onClose();
    }
  };

  return (
    <ModalFormCard<SliceModalValues>
      testId="rename-slice-modal"
      isOpen={isOpen}
      widthInPx="530px"
      formId={`rename-slice-modal-${slice?.model.id ?? ""}`}
      close={onClose}
      buttonLabel="Rename"
      onSubmit={(values) => void handleOnSubmit(values)}
      initialValues={{
        sliceName: initialSliceName,
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
            data-testid="slice-name-input"
            placeholder="Pascalised Slice API ID (e.g. TextBlock)"
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            error={touched.sliceName ? errors.sliceName : undefined}
            testId="slice-name-input"
          />
        </Box>
      )}
    </ModalFormCard>
  );
};
