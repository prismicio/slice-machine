import { Box } from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import ModalFormCard from "../../ModalFormCard";
import { InputBox } from "../components/InputBox";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { RESERVED_SLICE_NAME, API_ID_REGEX } from "@lib/consts";
import camelCase from "lodash/camelCase";
import { getLibraries, getRemoteSlices } from "@src/modules/slices";
import startCase from "lodash/startCase";

interface RenameSliceModalProps {
  sliceName: string;
  sliceId: string;
  libName: string;
  variationId: string;
}

export const RenameSliceModal: React.FC<RenameSliceModalProps> = ({
  sliceName,
  sliceId,
  libName,
  variationId,
}) => {
  const { renameSlice, closeModals } = useSliceMachineActions();
  const { isRenameSliceModalOpen, localLibs, remoteLibs } = useSelector(
    (store: SliceMachineStoreType) => ({
      isRenameSliceModalOpen: isModalOpen(store, ModalKeysEnum.RENAME_SLICE),
      localLibs: getLibraries(store),
      remoteLibs: getRemoteSlices(store),
    })
  );

  const handleOnSubmit = (values: { sliceName: string }) => {
    renameSlice(libName, sliceId, variationId, values.sliceName);
  };

  return (
    <ModalFormCard
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
      validate={({ sliceName }) => {
        if (!sliceName) {
          return { sliceName: "Cannot be empty" };
        }
        if (!API_ID_REGEX.exec(sliceName)) {
          return { sliceName: "No special characters allowed" };
        }
        const cased = startCase(camelCase(sliceName)).replace(/\s/gm, "");
        if (cased !== sliceName.trim()) {
          return { sliceName: "Value has to be PascalCased" };
        }
        if (RESERVED_SLICE_NAME.includes(sliceName)) {
          return {
            sliceName: `${sliceName} is reserved for Slice Machine use`,
          };
        }

        const localNames = localLibs.flatMap((lib) =>
          lib.components.map((slice) => slice.model.name)
        );
        const remoteNames = remoteLibs.map((slice) => slice.name);
        const usedNames = [...localNames, ...remoteNames];

        if (usedNames.includes(sliceName)) {
          return { sliceName: "Slice name is already taken." };
        }
      }}
    >
      {({ touched, errors }) => (
        <Box>
          <InputBox
            name="sliceName"
            label="Slice Name"
            data-cy="slice-name-input"
            placeholder="Pascalised Slice API ID (e.g. TextBlock)"
            error={touched.sliceName ? errors.sliceName : undefined}
            dataCy="slice-name-input"
          />
        </Box>
      )}
    </ModalFormCard>
  );
};
