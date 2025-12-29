import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useEffect, useState } from "react";

import { LibrarySlicesDialogContent } from "./LibrarySlicesDialogContent";
import { LocalSlicesDialogContent } from "./LocalSlicesDialogContent";
import { CommonDialogProps, DialogTab } from "./types";

type ImportSlicesFromLibraryModalProps = CommonDialogProps & {
  localSlices: (SharedSlice & { thumbnailUrl?: string })[];
  isEveryLocalSliceAdded: boolean;
  onSuccess: (args: {
    slices: { model: SharedSlice; langSmithUrl?: string }[];
    library?: string;
  }) => void;
};

export function ImportSlicesFromLibraryModal(
  props: ImportSlicesFromLibraryModalProps,
) {
  const { open, localSlices, isEveryLocalSliceAdded, onClose, ...commonProps } =
    props;
  const [selectedTab, setSelectedTab] = useState<DialogTab>("local");

  const onOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  useEffect(() => {
    if (!open) {
      setTimeout(() => setSelectedTab("local"), 250); // wait for the modal fade animation
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader title="Reuse an existing slice" />
      <DialogContent gap={0}>
        <DialogDescription hidden>
          Select existing slices or import slices from a GitHub repository
        </DialogDescription>
        <LocalSlicesDialogContent
          {...commonProps}
          open={open}
          selected={selectedTab === "local"}
          onSelectTab={setSelectedTab}
          slices={localSlices}
          isEveryLocalSliceAdded={isEveryLocalSliceAdded}
          onClose={onClose}
        />
        <LibrarySlicesDialogContent
          {...commonProps}
          open={open}
          selected={selectedTab === "library"}
          onSelectTab={setSelectedTab}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
