import path from 'path'
import Mustache from 'mustache'

import { AsObject } from "../../../lib/models/common/Variation"
import Slice from "../../../lib/models/common/Slice"

import Files from '../utils/files'

const Paths = {
  customStories(libraryName: string, sliceName: string): string {
    return path.join(process.cwd(), libraryName, sliceName, 'index.stories.js')
  },
  generatedStories(libraryName: string, sliceName: string): string {
    return path.join(process.cwd(), '.slicemachine', 'assets', libraryName, sliceName, 'index.stories.js')
  },
  storiesTemplate: path.join(__dirname, './storybook/stories.template.js')
}

export default {
  getStories(libraryName: string, sliceName: string): { exists: boolean, isCustom: boolean, storyPath?: string } {
    const stories = Files.read(Paths.customStories(libraryName, sliceName))
    
    return {
      isCustom: false,
      exists: false,
      storyPath: undefined
    }
  },

  purgeStories(libraryName: string, sliceName: string): void {
    Files.remove(Paths.customStories(libraryName, sliceName))
  },

  generateStory(libraryName: string, sliceName: string, sliceModel: Slice<AsObject>): void {
    console.log(sliceModel)

    const template = Files.read(Paths.storiesTemplate);

    const stories = Mustache.render(template, { sliceModel });

    Files.write(Paths.customStories(libraryName, sliceName), stories)
  }
}

// check for custom stories
// if custom there, do nothing


// check for default stories
// if default there => purge stories
// generate stories for all variations