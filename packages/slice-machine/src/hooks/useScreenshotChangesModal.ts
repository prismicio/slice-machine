import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useState } from "react";

import { SliceVariationSelector } from "@/legacy/components/ScreenshotChangesModal";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";

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
