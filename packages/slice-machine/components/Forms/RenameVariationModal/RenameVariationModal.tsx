import type { FC } from "react";
import { useSelector } from "react-redux";
import { Box } from "theme-ui";

import ModalFormCard from "@components/ModalFormCard";
import type { VariationModalValues } from "@components/Forms/formsTypes";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import type { SliceMachineStoreType } from "@src/redux/type";

type RenameVariationModalProps = {
  variationID: string;
  variationName: string;
};

export const RenameVariationModal: FC<RenameVariationModalProps> = (props) => {
  const { variationID, variationName } = props;

  const { closeModals } = useSliceMachineActions();
  const isOpen = useSelector((store: SliceMachineStoreType) =>
    isModalOpen(store, ModalKeysEnum.RENAME_VARIATION),
  );

  return (
    <ModalFormCard<VariationModalValues>
      buttonLabel="Rename"
      close={closeModals}
      content={{ title: "Rename a variation" }}
      formId={`rename-variation-modal-${variationID}`}
      initialValues={{ variationName }}
      isOpen={isOpen}
      onSubmit={(_values) => {
        //
      }}
      widthInPx="530px"
    >
      {() => <Box></Box>}
    </ModalFormCard>
  );
};
