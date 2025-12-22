import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useState } from "react";

import { LibrarySlicesDialogContent } from "./LibrarySlicesDialogContent";
import { LocalSlicesDialogContent } from "./LocalSlicesDialogContent";
import { CommonDialogProps } from "./types";

type ImportSlicesFromLibraryModalProps = CommonDialogProps & {
  availableSlices: (SharedSlice & { thumbnailUrl?: string })[];
  onSuccess: (args: { slices: SharedSlice[]; library?: string }) => void;
};

export function ImportSlicesFromLibraryModal(
  props: ImportSlicesFromLibraryModalProps,
) {
  const { open, availableSlices = [], onClose, ...commonProps } = props;
  const [selectedTab, setSelectedTab] = useState("local");

  const onOpenChange = (open: boolean) => {
    if (open) return;
    onClose();
    setSelectedTab("local");
  };

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
          availableSlices={availableSlices}
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
