import { Box } from "@prismicio/editor-ui";

import { SharedSliceCard } from "@/features/slices/sliceCards/SharedSliceCard";
import Grid from "@/legacy/components/Grid";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";

import { useImportSlicesContext } from "./ImportSlicesContext";

interface LocalSlicesTabProps {
  availableSlices: ReadonlyArray<ComponentUI>;
}

export function LocalSlicesTab(props: LocalSlicesTabProps) {
  const { availableSlices } = props;
  const { selectedLocalSlices, toggleLocalSlice } = useImportSlicesContext();

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
    <Box padding={16}>
      <Grid
        gridTemplateMinPx="200px"
        elems={availableSlices}
        defineElementKey={(slice) => `${slice.from}-${slice.model.name}`}
        renderElem={(slice) => {
          const isSelected = selectedLocalSlices.some(
            (s) => s.model.id === slice.model.id,
          );
          return (
            <SharedSliceCard
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
        }}
      />
    </Box>
  );
}

