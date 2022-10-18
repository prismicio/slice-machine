import { useState } from "react";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { SliceVariationSelector } from "@components/ScreenshotChangesModal";

type ModalPayload = {
  sliceFilterFn: (s: ComponentUI[]) => ComponentUI[];
  defaultVariationSelector?: SliceVariationSelector;
};

type Payload = {
  modalPayload: ModalPayload;
  onOpenModal: (p: ModalPayload) => void;
  openScreenshotsModal: () => void;
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
    openScreenshotsModal,
  };
};
