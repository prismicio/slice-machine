import {
  Box,
  Dialog,
  DialogActionButton,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogDescription,
  DialogHeader,
  Tab,
} from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useState } from "react";

import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";

import { getSubmitButtonLabel } from "../shared/getSubmitButtonLabel";
import { useExistingSlices } from "../shared/useExistingSlices";
import { useImportSlicesFromGithub } from "./hooks/useImportSlicesFromGithub";
import { LibrarySlicesTab } from "./LibrarySlicesTab";
import { LocalSlicesTab } from "./LocalSlicesTab";
import {
  ReuseExistingSlicesProvider,
  useReuseExistingSlicesContext,
} from "./ReuseExistingSlicesContext";

interface ReuseExistingSlicesDialogProps {
  open: boolean;
  location: "custom_type" | "page_type";
  typeName: string;
  availableSlices?: ReadonlyArray<ComponentUI>;
  onSuccess: (args: { slices: SharedSlice[]; library?: string }) => void;
  onClose: () => void;
}

function ReuseExistingSlicesDialogContent(
  props: ReuseExistingSlicesDialogProps,
) {
  const {
    open,
    location,
    typeName,
    availableSlices = [],
    onSuccess,
    onClose,
  } = props;
  const [selectedTab, setSelectedTab] = useState("local");

  const existingSlices = useExistingSlices({ open });
  const { resetSlices } = useImportSlicesFromGithub();
  const { submit, isSubmitting, totalSelected, reset } =
    useReuseExistingSlicesContext();

  const onOpenChange = (open: boolean) => {
    if (open || isSubmitting) return;
    onClose();
    reset();
    resetSlices();
  };

  const onSubmit = async () => {
    try {
      const result = await submit({ existingSlices, location, resetSlices });
      onSuccess(result);
    } catch (error) {
      // Error is already handled in the submit function
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader title="Reuse an existing slice" />
      <DialogContent gap={0}>
        <DialogDescription hidden>
          Select existing slices or import slices from a GitHub repository
        </DialogDescription>
        <Box flexDirection="column" flexGrow={1} minHeight={0}>
          <Box
            justifyContent="space-between"
            padding={16}
            border={{ bottom: true }}
          >
            <Box gap={8}>
              <Tab
                selected={selectedTab === "local"}
                onClick={() => setSelectedTab("local")}
              >
                Local Slices
              </Tab>
              <Tab
                selected={selectedTab === "library"}
                onClick={() => setSelectedTab("library")}
              >
                Library Slices
              </Tab>
            </Box>
            {selectedTab === "library" && "<repo-select>"}
          </Box>
          <Box
            minHeight={0}
            {...(selectedTab === "local"
              ? { display: "flex", flexDirection: "column", flexGrow: 1 }
              : { display: "none" })}
          >
            <LocalSlicesTab availableSlices={availableSlices} />
          </Box>
          <Box
            minHeight={0}
            {...(selectedTab === "library"
              ? { display: "flex", flexDirection: "column", flexGrow: 1 }
              : { display: "none" })}
          >
            <LibrarySlicesTab />
          </Box>
        </Box>

        <DialogActions>
          <DialogCancelButton disabled={isSubmitting} size="medium" />
          <DialogActionButton
            disabled={totalSelected === 0}
            loading={isSubmitting}
            onClick={() => void onSubmit()}
            size="medium"
          >
            {getSubmitButtonLabel(location, typeName)} ({totalSelected})
          </DialogActionButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

export function ReuseExistingSlicesDialog(
  props: ReuseExistingSlicesDialogProps,
) {
  return (
    <ReuseExistingSlicesProvider>
      <ReuseExistingSlicesDialogContent {...props} />
    </ReuseExistingSlicesProvider>
  );
}
