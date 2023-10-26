import { Box, Button } from "@prismicio/editor-ui";
import { useRouter } from "next/router";
import { type FC, useState } from "react";

import VariationModal from "@builders/SliceBuilder/Sidebar/VariationModal";
import ScreenshotChangesModal from "@components/ScreenshotChangesModal";
import type { ComponentUI } from "@lib/models/common/ComponentUI";
import type { VariationSM } from "@lib/models/common/Slice";
import { SharedSliceCard } from "@src/features/slices/sliceCards/SharedSliceCard";
import { SLICES_CONFIG } from "@src/features/slices/slicesConfig";
import { useScreenshotChangesModal } from "@src/hooks/useScreenshotChangesModal";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

type SidebarProps = {
  slice: ComponentUI;
  variation: VariationSM;
};

export const Sidebar: FC<SidebarProps> = ({ slice, variation }) => {
  const router = useRouter();

  const screenshotChangesModal = useScreenshotChangesModal();
  const { sliceFilterFn, defaultVariationSelector } =
    screenshotChangesModal.modalPayload;

  const [showVariationModal, setShowVariationModal] = useState(false);
  const { copyVariationSlice } = useSliceMachineActions();

  return (
    <>
      <Box flexDirection="column" gap={16}>
        {slice.model.variations.map((v) => (
          <SharedSliceCard
            action={{ type: "menu" }}
            key={v.id}
            mode="navigation"
            onUpdateScreenshot={() => {
              screenshotChangesModal.onOpenModal({
                sliceFilterFn: (s) => s,
                defaultVariationSelector: {
                  sliceID: slice.model.id,
                  variationID: v.id,
                },
              });
            }}
            replace
            selected={v.id === variation.id}
            slice={slice}
            variant="outlined"
            variationId={v.id}
          />
        ))}
        <Button
          onClick={() => {
            setShowVariationModal(true);
          }}
          startIcon="add"
          sx={{ bottom: 72, marginInline: 24, position: "sticky" }}
          variant="secondary"
        >
          Add a new variation
        </Button>
      </Box>
      <ScreenshotChangesModal
        slices={sliceFilterFn([slice])}
        defaultVariationSelector={defaultVariationSelector}
      />
      <VariationModal
        initialVariation={variation}
        isOpen={showVariationModal}
        onClose={() => {
          setShowVariationModal(false);
        }}
        onSubmit={(id, name, copiedVariation) => {
          copyVariationSlice(id, name, copiedVariation);
          const url = SLICES_CONFIG.getBuilderPagePathname({
            libraryName: slice.href,
            sliceName: slice.model.name,
            variationId: id,
          });
          void router.replace(url);
        }}
        variations={slice.model.variations}
      />
    </>
  );
};
