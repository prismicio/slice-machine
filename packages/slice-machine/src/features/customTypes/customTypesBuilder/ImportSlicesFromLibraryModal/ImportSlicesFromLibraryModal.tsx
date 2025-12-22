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

interface ImportSlicesFromLibraryModalProps {
  open: boolean;
  location: "custom_type" | "page_type";
  typeName: string;
  availableSlices: (SharedSlice & { thumbnailUrl?: string })[];
  onSuccess: (args: { slices: SharedSlice[]; library?: string }) => void;
  onClose: () => void;
}

export function ImportSlicesFromLibraryModal(
  props: ImportSlicesFromLibraryModalProps,
) {
  const {
    open,
    availableSlices = [],
    onSuccess,
    onClose,
    ...commonProps
  } = props;
  const [selectedTab, setSelectedTab] = useState("local");

  const onOpenChange = (open: boolean) => {
    if (open) return;
    onClose();
    // reset();
    // resetSlices();
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
          isSelected={selectedTab === "local"}
          onSelectTab={setSelectedTab}
          availableSlices={availableSlices}
          onSuccess={onSuccess}
          onClose={onClose}
        />
        <LibrarySlicesDialogContent
          {...commonProps}
          isSelected={selectedTab === "library"}
          onSelectTab={setSelectedTab}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
