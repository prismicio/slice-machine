import path from 'path'
import TemplateEngine from 'ejs'

import Files from '../../../lib/utils/files'
import { Framework } from '../../../lib/models/common/Framework'
import { CustomPaths, GeneratedPaths } from '../../../lib/models/paths'

import { createStorybookId } from '../../../lib/utils/str'

const Paths = {
  nuxtTemplate: (appRoot: string) => path.join(appRoot, 'templates/storybook/nuxt.template.ejs'),
  nextTemplate: (appRoot: string) => path.join(appRoot, 'templates/storybook/next.template.ejs'),
  getTemplate(appRoot: string, framework: Framework) {
    switch(framework) {
      case Framework.nuxt: return Paths.nuxtTemplate(appRoot)
      case Framework.vue: return Paths.nuxtTemplate(appRoot)
      case Framework.next: return Paths.nextTemplate(appRoot)
      case Framework.react: return Paths.nextTemplate(appRoot)
      default: return null
    }
  }
}

export default {
  generateStories(appRoot: string, framework: Framework, cwd: string, libraryName: string, sliceName: string): void {
    if(Files.exists(
      CustomPaths(cwd)
        .library(libraryName)
        .slice(sliceName)
        .stories()
    )) return


    const generatedMocksPath = GeneratedPaths(cwd)
      .library(libraryName)
      .slice(sliceName)
      .mocks()
    const customMocksPath = CustomPaths(cwd)
      .library(libraryName)
      .slice(sliceName)
      .mocks()
    
      // the output type should be Mocks but it's not typed yet
    const mocks = Files.readFirstOf<any, {}>([customMocksPath, generatedMocksPath])(
      (value: string) => JSON.parse(value)
    )
    if(!mocks) {
      console.error(`No mocks available, cannot generate stories`)
      return
    }
    
    const templatePath = Paths.getTemplate(appRoot, framework)
    if(!templatePath) {
      console.error(`We don't support storybook generated stories for ${framework} yet`)
      return
    }
    
    const template = Files.readString(templatePath)

    const withPascalizedIds = mocks.value.map((m: any) => {
      // use underscore to prevent invalid variable names
      const id = createStorybookId(m.variation || m.id)
      return {
        ...m,
        id,
      }
     })

    const componentPath = `../../../../${libraryName}/${sliceName}`
    const componentTitle = `${libraryName}/${sliceName}`
    const stories = TemplateEngine.render(template, { mocks: withPascalizedIds, componentPath, componentTitle });

    Files.write(
      GeneratedPaths(cwd)
        .library(libraryName)
        .slice(sliceName)
        .stories(),
      stories
    )
  }
}
