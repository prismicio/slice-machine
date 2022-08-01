import path from "path";
import TemplateEngine from "ejs";

import Files from "./utils/files";
import { CustomPaths, GeneratedPaths } from "./models/paths";
import { Models } from "@slicemachine/core";

import { createStorybookId } from "./utils/str";

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
    sliceName: string
  ): void {
    if (
      Files.exists(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        CustomPaths(cwd).library(libraryName).slice(sliceName).stories()
      )
    )
      return;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const generatedMocksPath = GeneratedPaths(cwd)
      .library(libraryName)
      .slice(sliceName)
      .mocks();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const customMocksPath = CustomPaths(cwd)
      .library(libraryName)
      .slice(sliceName)
      .mocks();

    // the output type should be Mocks but it's not typed yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    const mocks = Files.readFirstOf<any, {}>([
      customMocksPath,
      generatedMocksPath,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    ])((value: string) => JSON.parse(value));
    if (!mocks) {
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    const withPascalizedIds = (mocks.value || []).map((m: any) => {
      // use underscore to prevent invalid variable names
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
      const id = createStorybookId(m.variation || m.name);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return {
        ...m,
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
