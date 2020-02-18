const githubRepositories = {
  "vue-essential-slices": "prismicio/vue-essential-slices"
};

const libraries = {
  "vue-essential-slices": {
    git: "prismicio/vue-essential-slices",
    framework: "nuxt"
  }
};

const defaultLibraries = {
  nuxt: "vue-essential-slices"
};

const SM_CONFIG_FILE = "sm.config.json";
const SM_FILE = "sm.json";
const SM_FOLDER_NAME = "sliceMachine";

const SLICE_TYPE_KEY = 'slice_type'

module.exports = {
  libraries,
  defaultLibraries,
  githubRepositories,
  SM_CONFIG_FILE,
  SM_FOLDER_NAME,
  SM_FILE,
  SLICE_TYPE_KEY
};
