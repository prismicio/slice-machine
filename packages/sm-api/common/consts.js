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

const REGISTRY_URL = "https://unpkg.com/";

const MONGO_ERRORS_COLLECTION = "errors";
const MONGO_LIBRARIES_COLLECTION = "libraries";


module.exports = {
  libraries,
  defaultLibraries,
  githubRepositories,
  MONGO_ERRORS_COLLECTION,
  MONGO_LIBRARIES_COLLECTION,
  REGISTRY_URL,
  SM_CONFIG_FILE,
  SM_FOLDER_NAME,
  SM_FILE
};
