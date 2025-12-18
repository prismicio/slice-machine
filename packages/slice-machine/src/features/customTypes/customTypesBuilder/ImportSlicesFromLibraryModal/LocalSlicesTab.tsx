import { Box } from "@prismicio/editor-ui";

import { SharedSliceCard } from "@/features/slices/sliceCards/SharedSliceCard";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";

import { useReuseExistingSlicesContext } from "./ReuseExistingSlicesContext";

interface LocalSlicesTabProps {
  availableSlices: ReadonlyArray<ComponentUI>;
}

export function LocalSlicesTab(props: LocalSlicesTabProps) {
  const { availableSlices } = props;
  const { selectedLocalSlices, toggleLocalSlice } =
    useReuseExistingSlicesContext();

  if (availableSlices.length === 0) {
    return (
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
    );
  }

  return (
    <Box
      display="grid"
      gridTemplateColumns="1fr 1fr 1fr"
      gap={16}
      flexGrow={1}
      padding={16}
      minHeight={0}
    >
      {availableSlices.map((slice) => {
        const isSelected = selectedLocalSlices.some(
          (s) => s.model.id === slice.model.id,
        );
        return (
          <SharedSliceCard
            key={`${slice.from}-${slice.model.name}`}
            action={{ type: "checkbox" }}
            mode="selection"
            onSelectedChange={() => {
              toggleLocalSlice(slice);
            }}
            selected={isSelected}
            slice={slice}
            variant="outlined"
          />
        );
      })}
    </Box>
  );
}
