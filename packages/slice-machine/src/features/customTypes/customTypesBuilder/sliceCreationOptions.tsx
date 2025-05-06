import { BackgroundIcon } from "@prismicio/editor-ui";

import { UseSectionsNamingExperimentReturnType } from "@/features/builder/useSectionsNamingExperiment";
import { pluralize } from "@/utils/textConversion";

type SliceCreationOptionArgs = {
  menuType: "ActionList" | "Dropdown";
  sectionsNamingExperiment: UseSectionsNamingExperimentReturnType;
};

export const getSliceCreationOptions = (args: SliceCreationOptionArgs) => {
  const { menuType, sectionsNamingExperiment } = args;

  return {
    fromImage: {
      BackgroundIcon: (
        <BackgroundIcon
          name="autoFixHigh"
          size={menuType === "ActionList" ? "small" : "extraSmall"}
          iconSize={menuType === "ActionList" ? "medium" : "small"}
          color="purple"
          variant="solid"
          radius={6}
        />
      ),
      title: "Generate from image",
      description: `Build a ${sectionsNamingExperiment.value} based on your design image.`,
    },
    fromScratch: {
      BackgroundIcon: (
        <BackgroundIcon
          name="add"
          size={menuType === "ActionList" ? "small" : "extraSmall"}
          iconSize={menuType === "ActionList" ? "medium" : "small"}
          color="white"
          variant="solid"
          radius={6}
        />
      ),
      title: "Start from scratch",
      description: `Build a custom ${sectionsNamingExperiment.value} your way.`,
    },
    fromTemplate: {
      BackgroundIcon: (
        <BackgroundIcon
          name="contentCopy"
          size={menuType === "ActionList" ? "small" : "extraSmall"}
          iconSize={menuType === "ActionList" ? "medium" : "small"}
          color="white"
          variant="solid"
          radius={6}
        />
      ),
      title: "Use a template",
      description: "Choose from ready-made examples.",
    },
    fromExisting: {
      BackgroundIcon: (
        <BackgroundIcon
          name="folder"
          size={menuType === "ActionList" ? "small" : "extraSmall"}
          iconSize={menuType === "ActionList" ? "medium" : "small"}
          color="white"
          variant="solid"
          radius={6}
        />
      ),
      title: `Reuse an existing ${sectionsNamingExperiment.value}`,
      description: `Select from your created ${pluralize(
        sectionsNamingExperiment.value,
      )}`,
    },
  };
};
