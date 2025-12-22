import { Box, ScrollArea } from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { DialogButtons } from "./DialogButtons";
import { DialogContent } from "./DialogContent";
import { DialogTabHeader } from "./DialogTabHeader";
import { SliceCard } from "./SliceCard";

export function ReuseSlicesDialogContent() {}

interface LocalSlicesDialogContentProps {
  open: boolean;
  location: "custom_type" | "page_type";
  typeName: string;
  availableSlices: (SharedSlice & { thumbnailUrl?: string })[];
  onSuccess: (args: { slices: SharedSlice[] }) => void;
  onClose: () => void;
  onSelectTab: (tab: "local" | "library") => void;
  isSelected: boolean;
}

export function LocalSlicesDialogContent(props: LocalSlicesDialogContentProps) {
  const {
    open,
    location,
    typeName,
    onSelectTab,
    onSuccess,
    availableSlices = [],
    isSelected,
  } = props;

  const [selectedSlices, setSelectedSlices] = useState<SharedSlice[]>([]);

  useEffect(() => {
    if (!open) setSelectedSlices([]);
  }, [open]);

  const onSubmit = () => {
    if (selectedSlices.length === 0) {
      return toast.error("Please select at least one slice");
    }

    onSuccess({ slices: selectedSlices });
  };

  const toggleSliceSelected = (slice: SharedSlice) => {
    setSelectedSlices((prev) => {
      const isSelected = prev.some((s) => s.id === slice.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== slice.id);
      }
      return [...prev, slice];
    });
  };

  return (
    <DialogContent selected={isSelected}>
      <DialogTabHeader selectedTab="local" onSelectTab={onSelectTab} />

      <Box display="flex" flexDirection="column" flexGrow={1} minHeight={0}>
        {availableSlices.length > 0 ? (
          <ScrollArea stableScrollbar={false}>
            <Box
              display="grid"
              gridTemplateColumns="1fr 1fr 1fr"
              gap={16}
              flexGrow={1}
              padding={16}
              minHeight={0}
            >
              {availableSlices.map((slice) => {
                const isSelected = selectedSlices.some(
                  (s) => s.id === slice.id,
                );

                return (
                  <SliceCard
                    key={slice.id}
                    model={slice}
                    thumbnailUrl={slice.thumbnailUrl}
                    selected={isSelected}
                    onSelectedChange={() => toggleSliceSelected(slice)}
                  />
                );
              })}
            </Box>
          </ScrollArea>
        ) : (
          <Box padding={16} height="100%" flexDirection="column" gap={16}>
            <Box flexDirection="column" gap={8}>
              <Box
                display="flex"
                flexDirection="column"
                gap={8}
                padding={16}
                alignItems="center"
                justifyContent="center"
              >
                No local slices available
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <DialogButtons
        totalSelected={selectedSlices.length}
        onSubmit={onSubmit}
        location={location}
        typeName={typeName}
      />
    </DialogContent>
  );
}
