import {
  ActionList,
  ActionListItem,
  BlankSlate,
  BlankSlateActions,
  BlankSlateDescription,
  BlankSlateIcon,
  BlankSlateTitle,
} from "@prismicio/editor-ui";
import { FC } from "react";

import { useAiSliceGenerationExperiment } from "@/features/builder/useAiSliceGenerationExperiment";

export type SliceZoneBlankSlateProps = {
  openUpdateSliceZoneModal: () => void;
  openCreateSliceModal: () => void;
  openGenerateSliceWithAiModal: () => void;
  openSlicesTemplatesModal: () => void;
  projectHasAvailableSlices: boolean;
  isSlicesTemplatesSupported: boolean;
};

export const SliceZoneBlankSlate: FC<SliceZoneBlankSlateProps> = ({
  openCreateSliceModal,
  openGenerateSliceWithAiModal,
  openUpdateSliceZoneModal,
  openSlicesTemplatesModal,
  projectHasAvailableSlices,
  isSlicesTemplatesSupported,
}) => {
  const aiSliceGenerationExperiment = useAiSliceGenerationExperiment();

  return (
    <BlankSlate data-testid="slice-zone-blank-slate" sx={{ width: 648 }}>
      <BlankSlateIcon
        lineColor="purple9"
        backgroundColor="purple5"
        name="add"
        size="large"
      />
      <BlankSlateTitle size="big">Add slices</BlankSlateTitle>
      <BlankSlateDescription>
        Slices are website sections that you can reuse on different pages with
        different content. Each slice has its own component in your code.
      </BlankSlateDescription>
      <BlankSlateActions>
        <ActionList>
          {aiSliceGenerationExperiment.eligible && (
            <ActionListItem
              startIcon="autoFixHigh"
              onClick={openGenerateSliceWithAiModal}
              description="Let AI instantly create a Slice for you."
            >
              Generate with AI
            </ActionListItem>
          )}
          <ActionListItem
            startIcon="add"
            onClick={openCreateSliceModal}
            description="Build a custom Slice your way."
          >
            Start from scratch
          </ActionListItem>
          {isSlicesTemplatesSupported && (
            <ActionListItem
              startIcon="contentCopy"
              onClick={openSlicesTemplatesModal}
              description="Choose from ready-made examples."
            >
              Use a template
            </ActionListItem>
          )}
          {projectHasAvailableSlices && (
            <ActionListItem
              startIcon="folder"
              onClick={openUpdateSliceZoneModal}
              description="Select from your created Slices."
            >
              Reuse an existing Slice
            </ActionListItem>
          )}
        </ActionList>
      </BlankSlateActions>
    </BlankSlate>
  );
};
