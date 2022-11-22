import path from "path";
import TemplateEngine from "ejs";
import { getOrElseW } from "fp-ts/Either";
import Files from "@slicemachine/core/build/node-utils/files";
import { CustomPaths, GeneratedPaths } from "./models/paths";
import { Models } from "@slicemachine/core";
import { renderSliceMock } from "@prismicio/mocks";
import { createStorybookId } from "./utils/str";
import {
  Slices,
  SliceSM,
  ComponentMocks,
} from "@slicemachine/core/build/models";

const Paths = {
  nuxtTemplate: (appRoot: string) =>
    path.join(appRoot, "templates/storybook/nuxt.template.ejs"),
  nextTemplate: (appRoot: string) =>
    path.join(appRoot, "templates/storybook/next.template.ejs"),
  svelteTemplate: (appRoot: string) =>
    path.join(appRoot, "templates/storybook/svelte.template.ejs"),
  getTemplate(appRoot: string, framework: Models.Frameworks) {
    switch (framework) {
      case Models.Frameworks.nuxt:
      case Models.Frameworks.previousNuxt:
        return Paths.nuxtTemplate(appRoot);
      case Models.Frameworks.vue:
        return Paths.nuxtTemplate(appRoot);
      case Models.Frameworks.next:
      case Models.Frameworks.previousNext:
        return Paths.nextTemplate(appRoot);
      case Models.Frameworks.react:
        return Paths.nextTemplate(appRoot);
      case Models.Frameworks.svelte:
        return Paths.svelteTemplate(appRoot);
      case Models.Frameworks.vanillajs:
        return Paths.nextTemplate(appRoot);
      default:
        return null;
    }
  },
};

export default {
  generateStories(
    appRoot: string,
    framework: Models.Frameworks,
    cwd: string,
    libraryName: string,
    sliceName: string,
    sliceModel: SliceSM
  ): void {
    if (
      Files.exists(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        CustomPaths(cwd).library(libraryName).slice(sliceName).stories()
      )
    )
      return;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const mocksPath = CustomPaths(cwd)
      .library(libraryName)
      .slice(sliceName)
      .mocks();

    // the output type should be Mocks but it's not typed yet
    const mocks = Files.readEntity<ComponentMocks>(
      mocksPath,
      (payload: unknown) => {
        return getOrElseW(() => new Error("Invalid SharedSlice mocks"))(
          ComponentMocks.decode(payload)
        );
      }
    );

    if (!mocks || mocks instanceof Error) {
      console.error(`No mocks available, cannot generate stories`);
      return;
    }

    const templatePath = Paths.getTemplate(appRoot, framework);
    if (!templatePath) {
      console.error(
        `We don't support storybook generated stories for ${framework} yet`
      );
      return;
    }

    const template = Files.readString(templatePath);

    const withPascalizedIds = (mocks || []).map((mock) => {
      const shareSlice = Slices.fromSM(sliceModel);
      // TODO: have a codec or type for api format
      const apiMock = renderSliceMock(shareSlice, mock) as Record<
        string,
        unknown
      >;
      const id = createStorybookId(mock.variation);
      return {
        ...apiMock,
        id,
      };
    });

    const componentPath = path
      .join(
        "..",
        path.relative(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          GeneratedPaths(cwd).library(libraryName).value(),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          CustomPaths(cwd).library(libraryName).value()
        ),
        sliceName
      )
      .split(path.sep)
      .join(path.posix.sep);

    const componentTitle = `${libraryName}/${sliceName}`;
    const stories = TemplateEngine.render(template, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      mocks: withPascalizedIds,
      componentPath,
      componentTitle,
    });

    Files.write(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      GeneratedPaths(cwd)
        .library(libraryName)
        .slice(sliceName)
        .stories(
          framework === Models.Frameworks.svelte
            ? "index.stories.svelte"
            : undefined
        ),
      stories
    );
  },
};
