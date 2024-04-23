import { ActionList, ActionListItem, Badge, Box } from "@prismicio/editor-ui";
import { FC } from "react";

import {
  BlankSlate,
  BlankSlateActions,
  BlankSlateContent,
  BlankSlateDescription,
  BlankSlateTitle,
} from "@/components/BlankSlate";
import { SliceMachinePrinterIcon } from "@/icons/SliceMachinePrinterIcon";

export type SliceZoneBlankSlateProps = {
  openUpdateSliceZoneModal: () => void;
  openCreateSliceModal: () => void;
  openSlicesTemplatesModal: () => void;
  projectHasAvailableSlices: boolean;
  isSlicesTemplatesSupported: boolean;
};

export const SliceZoneBlankSlate: FC<SliceZoneBlankSlateProps> = ({
  openCreateSliceModal,
  openUpdateSliceZoneModal,
  openSlicesTemplatesModal,
  projectHasAvailableSlices,
  isSlicesTemplatesSupported,
}) => {
  return (
    <Box
      flexGrow={1}
      justifyContent="center"
      data-testid="slice-zone-blank-slate"
    >
      <BlankSlate backgroundImage="/blank-slate-slice-zone.png">
        <BlankSlateContent>
          <Box justifyContent="center" padding={{ bottom: 16 }}>
            <SliceMachinePrinterIcon />
          </Box>
          <BlankSlateTitle>Add slices</BlankSlateTitle>
          <BlankSlateDescription>
            Slices are website sections that you can reuse on different pages
            with different content. Each slice has its own component in your
            code.
          </BlankSlateDescription>
          <BlankSlateActions>
            <ActionList>
              <ActionListItem
                startIcon="add"
                onClick={openCreateSliceModal}
                description="Start from scratch."
              >
                Create new
              </ActionListItem>
              {isSlicesTemplatesSupported ? (
                <ActionListItem
                  startIcon="contentCopy"
                  onClick={openSlicesTemplatesModal}
                  description="Select from premade examples."
                  endAdornment={<Badge color="purple" title="New" />}
                >
                  Use template
                </ActionListItem>
              ) : undefined}
              {projectHasAvailableSlices ? (
                <ActionListItem
                  startIcon="folder"
                  onClick={openUpdateSliceZoneModal}
                  description="Select from your own slices."
                >
                  Select existing
                </ActionListItem>
              ) : undefined}
            </ActionList>
          </BlankSlateActions>
        </BlankSlateContent>
      </BlankSlate>
    </Box>
  );
};
