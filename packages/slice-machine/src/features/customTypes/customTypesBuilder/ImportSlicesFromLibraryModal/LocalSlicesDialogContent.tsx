import { Box, ScrollArea } from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { EmptyView } from "@/features/customTypes/customTypesBuilder/ImportSlicesFromLibraryModal/EmptyView";

import { DialogButtons } from "./DialogButtons";
import { DialogContent } from "./DialogContent";
import { DialogTabs } from "./DialogTabs";
import { SliceCard } from "./SliceCard";
import { CommonDialogContentProps } from "./types";

interface LocalSlicesDialogContentProps extends CommonDialogContentProps {
  slices: (SharedSlice & { thumbnailUrl?: string })[];
  isEveryLocalSliceAdded: boolean;
  onSuccess: (args: { slices: { model: SharedSlice }[] }) => void;
}

export function LocalSlicesDialogContent(props: LocalSlicesDialogContentProps) {
  const {
    open,
    typeName,
    onSelectTab,
    onSuccess,
    slices,
    isEveryLocalSliceAdded,
    selected,
  } = props;

  const [selectedSlices, setSelectedSlices] = useState<SharedSlice[]>([]);

  useEffect(() => {
    if (!open) setSelectedSlices([]);
  }, [open]);

  const onSubmit = () => {
    if (selectedSlices.length === 0) {
      toast.error("Please select at least one slice");
      return;
    }

    onSuccess({ slices: selectedSlices.map((s) => ({ model: s })) });
  };

  const onSelect = (slice: SharedSlice) => {
    setSelectedSlices((prev) => {
      const isSelected = prev.some((s) => s.id === slice.id);
      if (isSelected) return prev.filter((s) => s.id !== slice.id);
      return [...prev, slice];
    });
  };

  return (
    <DialogContent selected={selected}>
      <DialogTabs selectedTab="local" onSelectTab={onSelectTab} />

      <Box display="flex" flexDirection="column" flexGrow={1} minHeight={0}>
        {slices.length > 0 ? (
          <>
            <ScrollArea stableScrollbar={false}>
              <Box
                display="grid"
                gridTemplateColumns="1fr 1fr 1fr"
                gap={16}
                flexGrow={1}
                padding={16}
                minHeight={0}
              >
                {slices.map((slice) => {
                  const isSelected = selectedSlices.some(
                    (s) => s.id === slice.id,
                  );

                  return (
                    <SliceCard
                      key={slice.name}
                      model={slice}
                      thumbnailUrl={slice.thumbnailUrl}
                      selected={isSelected}
                      onSelectedChange={() => onSelect(slice)}
                    />
                  );
                })}
              </Box>
            </ScrollArea>

            <DialogButtons
              totalSelected={selectedSlices.length}
              onSubmit={onSubmit}
              typeName={typeName}
            />
          </>
        ) : (
          <EmptyView
            title="No local slices available"
            description={
              isEveryLocalSliceAdded
                ? "All local slices have already been added to your slice zone."
                : undefined
            }
            icon="alert"
          />
        )}
      </Box>
    </DialogContent>
  );
}
