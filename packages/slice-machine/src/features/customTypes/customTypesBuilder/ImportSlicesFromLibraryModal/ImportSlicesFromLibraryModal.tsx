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
import {
  ImportSlicesProvider,
  useImportSlicesContext,
} from "./ImportSlicesContext";
import { LibrarySlicesTab } from "./LibrarySlicesTab";
import { LocalSlicesTab } from "./LocalSlicesTab";

interface ImportSlicesFromLibraryModalProps {
  open: boolean;
  location: "custom_type" | "page_type" | "slices";
  availableSlices?: ReadonlyArray<ComponentUI>;
  onSuccess: (args: { slices: SharedSlice[]; library?: string }) => void;
  onClose: () => void;
}

function ImportSlicesFromLibraryModalContent(
  props: ImportSlicesFromLibraryModalProps,
) {
  const { open, location, availableSlices = [], onSuccess, onClose } = props;
  const [selectedTab, setSelectedTab] = useState(
    location === "slices" ? "library" : "local",
  );

  const existingSlices = useExistingSlices({ open });
  const { resetSlices } = useImportSlicesFromGithub();
  const { submit, isSubmitting, totalSelected, reset } =
    useImportSlicesContext();

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
              {location !== "slices" && (
                <>
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
                </>
              )}
            </Box>
            {selectedTab === "library" && "<repo-select>"}
          </Box>
          {location !== "slices" && (
            <Box
              minHeight={0}
              {...(selectedTab === "local"
                ? { display: "flex", flexDirection: "column", flexGrow: 1 }
                : { display: "none" })}
            >
              <LocalSlicesTab availableSlices={availableSlices} />
            </Box>
          )}
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
          <DialogCancelButton disabled={isSubmitting} />
          <DialogActionButton
            disabled={totalSelected === 0}
            loading={isSubmitting}
            onClick={() => void onSubmit()}
          >
            {getSubmitButtonLabel(location)} ({totalSelected})
          </DialogActionButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

export function ImportSlicesFromLibraryModal(
  props: ImportSlicesFromLibraryModalProps,
) {
  return (
    <ImportSlicesProvider>
      <ImportSlicesFromLibraryModalContent {...props} />
    </ImportSlicesProvider>
  );
}
