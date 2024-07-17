import { Text } from "@prismicio/editor-ui";

import type { OnboardingStep } from "@/features/onboarding/types";

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "createPage",
    title: "Create Your Page",
    description: "Setup a new page.",
  },
  {
    id: "codePage",
    title: "Code your page",
    description: "Build your page's structure",
  },
  {
    id: "addSlice",
    title: "Add a Slice",
    description: "Insert reusable sections.",
  },
  {
    id: "pushModels",
    title: "Push Your Models",
    description: "Deploy your models.",
  },
  {
    id: "writeContent",
    title: "Write Content",
    description: "Add engaging content.",
  },
];

type GetOnboardingStepsContentProps = {
  repositoryUrl: string;
};

export const getOnboardingStepsContent = ({
  repositoryUrl,
}: GetOnboardingStepsContentProps) => ({
  createPage: {
    videoUrl:
      "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/ADD_SLICE.mp4",
    content:
      "Commodo irure ipsum exercitation consequat enim velit amet commodo. Excepteur proident Lorem sunt enim amet tempor qui Lorem non non Lorem. Ex sint elit ea. Proident veniam dolor cupidatat amet aute consectetur. Non ad consectetur irure adipisicing aliquip. Ipsum nulla velit mollit magna aliqua eu veniam. Commodo elit labore veniam nulla dolor aliqua esse proident pariatur nostrud.",
  },
  codePage: {
    videoUrl:
      "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/CODE_SNIP.mp4",
    content:
      "Nulla consequat occaecat ut ut ex culpa veniam sunt nisi nisi. Velit excepteur excepteur do anim incididunt in cillum ullamco occaecat minim reprehenderit eu enim. Nulla irure est fugiat aliqua elit excepteur labore ipsum occaecat eu minim duis non sit. Ea eu irure dolore duis labore ad. Quis sunt eu commodo sit nisi ullamco qui aliqua nostrud labore nostrud ut nostrud nostrud.",
  },
  addSlice: {
    videoUrl:
      "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/PUSH.mp4",
    content:
      "Minim anim velit laboris cupidatat cupidatat culpa labore sunt eiusmod. Consequat culpa mollit enim dolore aliquip ex voluptate ex eiusmod incididunt eu. Cillum magna cillum magna consectetur. Id aliquip excepteur adipisicing officia excepteur et pariatur aliquip aliquip laborum.",
  },
  pushModels: {
    videoUrl:
      "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/PREVIEW.mp4",
    content:
      "Ipsum aliqua do consequat eiusmod id. Reprehenderit consectetur sit officia consequat velit non officia aliquip laboris incididunt cillum proident incididunt. Ad quis laborum tempor dolor duis ea cillum aliqua occaecat. Sunt reprehenderit fugiat et ullamco proident pariatur deserunt minim. Irure enim nulla et ad ut id anim elit. Voluptate culpa esse qui et reprehenderit aute est.",
  },
  writeContent: {
    videoUrl:
      "https://res.cloudinary.com/dmtf1daqp/video/upload/v1700213517/IN-APP-GUIDE-SM/WRITE.mp4",
    content: () => (
      <Text>
        Open your{" "}
        <Text href={repositoryUrl} underline>
          Page Builder
        </Text>
        , create a page, add slices, save, and publish. Then, come back here.
      </Text>
    ),
  },
});
