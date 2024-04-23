import { SliceVariationSelector } from "@components/ScreenshotChangesModal";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useState } from "react";

type ModalPayload = {
  sliceFilterFn: (s: ComponentUI[]) => ComponentUI[];
  defaultVariationSelector?: SliceVariationSelector;
  onUploadSuccess?: (newSlice: ComponentUI) => void;
};

type Payload = {
  modalPayload: ModalPayload;
  onOpenModal: (p: ModalPayload) => void;
};

export const useScreenshotChangesModal = (): Payload => {
  const { openScreenshotsModal } = useSliceMachineActions();

  const [modalPayload, setModalPayload] = useState<ModalPayload>({
    sliceFilterFn: (s: ComponentUI[]) => s,
  });

  const onOpenModal = (payload: ModalPayload) => {
    setModalPayload(payload);
    openScreenshotsModal();
  };

  return {
    modalPayload,
    onOpenModal,
  };
};
