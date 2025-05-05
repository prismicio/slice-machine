import { BackgroundIcon } from "@prismicio/editor-ui";

import { UseSectionsExperimentReturnType } from "@/features/builder/useSectionsExperiment";

type SliceCreationOptionArgs = {
  menuType: "ActionList" | "Dropdown";
  sectionsExperiment: UseSectionsExperimentReturnType;
};

export const getSliceCreationOptions = (args: SliceCreationOptionArgs) => {
  const { menuType, sectionsExperiment } = args;

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
      description: `Build a ${sectionsExperiment.singular.uppercase} based on your design image.`,
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
      description: `Build a custom ${sectionsExperiment.singular.uppercase} your way.`,
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
      title: `Reuse an existing ${sectionsExperiment.singular.uppercase}`,
      description: `Select from your created ${sectionsExperiment.plural.uppercase}`,
    },
  };
};
