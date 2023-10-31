import { Box, Button } from "@prismicio/editor-ui";
import { useRouter } from "next/router";
import { type FC, useState } from "react";

import AddVariationModal from "@builders/SliceBuilder/Sidebar/AddVariationModal";
import { DeleteVariationModal } from "@components/DeleteVariationModal";
import { RenameVariationModal } from "@components/Forms/RenameVariationModal";
import ScreenshotChangesModal from "@components/ScreenshotChangesModal";
import type { ComponentUI } from "@lib/models/common/ComponentUI";
import type { VariationSM } from "@lib/models/common/Slice";
import { Variation } from "@lib/models/common/Variation";
import { SharedSliceCard } from "@src/features/slices/sliceCards/SharedSliceCard";
import { SLICES_CONFIG } from "@src/features/slices/slicesConfig";
import { useScreenshotChangesModal } from "@src/hooks/useScreenshotChangesModal";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

type SidebarProps = {
  slice: ComponentUI;
  variation: VariationSM;
  updateSlice: (slice: ComponentUI) => void;
};

export const Sidebar: FC<SidebarProps> = (props) => {
  const { slice, variation, updateSlice } = props;

  const {
    copyVariationSlice,
    openDeleteVariationModal,
    openRenameVariationModal,
  } = useSliceMachineActions();

  const [variationToEdit, setVariationToEdit] = useState<VariationSM>();

  const screenshotChangesModal = useScreenshotChangesModal();
  const { sliceFilterFn, defaultVariationSelector } =
    screenshotChangesModal.modalPayload;

  const [showAddVariationModal, setShowAddVariationModal] = useState(false);
  const router = useRouter();

  return (
    <>
      <Box flexDirection="column" gap={16}>
        {slice.model.variations.map((v) => (
          <SharedSliceCard
            action={{
              type: "menu",
              onRemove: () => {
                setVariationToEdit(v);
                openDeleteVariationModal();
              },
              onRename: () => {
                setVariationToEdit(v);
                openRenameVariationModal();
              },
            }}
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
            setShowAddVariationModal(true);
          }}
          startIcon="add"
          sx={{ bottom: 72, marginInline: 24, position: "sticky" }}
          variant="secondary"
        >
          Add a new variation
        </Button>
      </Box>
      <RenameVariationModal
        variationID={variationToEdit?.id ?? ""}
        variationName={variationToEdit?.name ?? ""}
      />
      <ScreenshotChangesModal
        slices={sliceFilterFn([slice])}
        defaultVariationSelector={defaultVariationSelector}
      />
      <DeleteVariationModal variationID={variationToEdit?.id ?? ""} />
      <AddVariationModal
        initialVariation={variation}
        isOpen={showAddVariationModal}
        onClose={() => {
          setShowAddVariationModal(false);
        }}
        onSubmit={(id, name, copiedVariation) => {
          copyVariationSlice(id, name, copiedVariation);

          // We have to immediately save the new variation to prevent an
          // infinite loop related to screenshots handling.
          const newVariation = Variation.copyValue(copiedVariation, id, name);
          const newSlice = {
            ...slice,
            model: {
              ...slice.model,
              variations: [...slice.model.variations, newVariation],
            },
          };
          updateSlice(newSlice);

          const url = SLICES_CONFIG.getBuilderPagePathname({
            libraryName: newSlice.href,
            sliceName: newSlice.model.name,
            variationId: newVariation.id,
          });
          void router.replace(url);
        }}
        variations={slice.model.variations}
      />
    </>
  );
};
