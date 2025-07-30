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

import { useSectionsNamingExperiment } from "@/features/builder/useSectionsNamingExperiment";
import { capitalizeFirstLetter, pluralize } from "@/utils/textConversion";

import { getSliceCreationOptions } from "./sliceCreationOptions";

export type SliceZoneBlankSlateProps = {
  openUpdateSliceZoneModal: () => void;
  openCreateSliceModal: () => void;
  openCreateSliceFromImageModal: () => void;
  openSlicesTemplatesModal: () => void;
  projectHasAvailableSlices: boolean;
  isSlicesTemplatesSupported: boolean;
};

export const SliceZoneBlankSlate: FC<SliceZoneBlankSlateProps> = ({
  openCreateSliceModal,
  openCreateSliceFromImageModal,
  openUpdateSliceZoneModal,
  openSlicesTemplatesModal,
  projectHasAvailableSlices,
  isSlicesTemplatesSupported,
}) => {
  const sectionsNamingExperiment = useSectionsNamingExperiment();
  const sliceCreationOptions = getSliceCreationOptions({
    menuType: "ActionList",
    sectionsNamingExperiment,
  });

  return (
    <BlankSlate data-testid="slice-zone-blank-slate" sx={{ width: 648 }}>
      <BlankSlateIcon
        lineColor="purple9"
        backgroundColor="purple5"
        name="add"
        size="large"
      />
      <BlankSlateTitle size="big">
        Add {pluralize(sectionsNamingExperiment.value)}
      </BlankSlateTitle>
      <BlankSlateDescription>
        {pluralize(capitalizeFirstLetter(sectionsNamingExperiment.value))} are
        website sections that you can reuse on different pages with different
        content. Each on different pages with different content. Each{" "}
        {sectionsNamingExperiment.value} has its own component in your code.
      </BlankSlateDescription>
      <BlankSlateActions>
        <ActionList>
          <ActionListItem
            renderStartIcon={() =>
              sliceCreationOptions.fromImage.BackgroundIcon
            }
            onClick={openCreateSliceFromImageModal}
            description={sliceCreationOptions.fromImage.description}
          >
            {sliceCreationOptions.fromImage.title}
          </ActionListItem>
          <ActionListItem
            renderStartIcon={() =>
              sliceCreationOptions.fromScratch.BackgroundIcon
            }
            onClick={openCreateSliceModal}
            description={sliceCreationOptions.fromScratch.description}
          >
            {sliceCreationOptions.fromScratch.title}
          </ActionListItem>
          {isSlicesTemplatesSupported && (
            <ActionListItem
              renderStartIcon={() =>
                sliceCreationOptions.fromTemplate.BackgroundIcon
              }
              onClick={openSlicesTemplatesModal}
              description={sliceCreationOptions.fromTemplate.description}
            >
              {sliceCreationOptions.fromTemplate.title}
            </ActionListItem>
          )}
          {projectHasAvailableSlices && (
            <ActionListItem
              renderStartIcon={() =>
                sliceCreationOptions.fromExisting.BackgroundIcon
              }
              onClick={openUpdateSliceZoneModal}
              description={sliceCreationOptions.fromExisting.description}
            >
              {sliceCreationOptions.fromExisting.title}
            </ActionListItem>
          )}
        </ActionList>
      </BlankSlateActions>
    </BlankSlate>
  );
};
