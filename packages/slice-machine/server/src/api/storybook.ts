/* global variable define in server/src/index.js */
declare var appRoot: string;

import path from 'path'
import TemplateEngine from 'ejs'

import Files from '../../../lib/utils/files'
import { CustomPaths, GeneratedPaths } from '../../../lib/models/paths'
import { pascalize } from '../../../lib/utils/str';

const Paths = {
  storiesTemplate: (appRoot: string) => path.join(appRoot, '../../../templates/stories.template.ejs')
}

export default {
  generateStories(cwd: string, libraryName: string, sliceName: string): void {
    if(Files.exists(
      CustomPaths(cwd)
        .library(libraryName)
        .slice(sliceName)
        .stories()
    )) return // we don't generate a story if a custom one already exists


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
    
    const template = Files.readString(Paths.storiesTemplate(appRoot));
    console.log("mocks")
    console.log(mocks)

    const withPascalizedIds = mocks.value.map( (m: any) => {
      const id = pascalize(m.id)
      return {
        ...m,
        id,
        title: `${libraryName}/${sliceName}/${id}`
      }
     })

    const componentPath = `../../../../${libraryName}/${sliceName}`
    const stories = TemplateEngine.render(template, { mocks: withPascalizedIds, componentPath });

    Files.write(
      GeneratedPaths(cwd)
        .library(libraryName)
        .slice(sliceName)
        .stories(),
      stories
    )
  }
}
