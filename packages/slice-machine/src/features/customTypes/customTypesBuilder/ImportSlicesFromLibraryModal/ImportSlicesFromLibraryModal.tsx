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
  open: boolean;
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
  const {
    open,
    localSlices,
    isEveryLocalSliceAdded,
    onClose,
    ...contentProps
  } = props;

  const [selectedTab, setSelectedTab] = useState<DialogTab>("local");

  useEffect(() => {
    if (!open) {
      // wait for the modal fade animation
      const timeout = setTimeout(() => {
        setSelectedTab("local");
      }, 250);

      return () => clearTimeout(timeout);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader title="Reuse an existing slice" />
      <DialogContent gap={0}>
        <DialogDescription hidden>
          Select existing slices or import slices from a GitHub repository
        </DialogDescription>
        <LocalSlicesDialogContent
          {...contentProps}
          selected={selectedTab === "local"}
          onSelectTab={setSelectedTab}
          slices={localSlices}
          isEveryLocalSliceAdded={isEveryLocalSliceAdded}
          onClose={onClose}
        />
        <LibrarySlicesDialogContent
          {...contentProps}
          selected={selectedTab === "library"}
          onSelectTab={setSelectedTab}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
