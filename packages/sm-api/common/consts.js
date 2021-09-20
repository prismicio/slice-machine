const libraries = {
  "vue-essential-slices": {
    git: "prismicio/vue-essential-slices",
    framework: "nuxt",
  },
  "essential-slices": {
    git: "prismicio/essential-slices",
    framework: "next",
  },
};

const SUPPORTED_FRAMEWORKS = ["nuxt", "next"];

const SM_CONFIG_FILE = "sm.config.json";
const SM_FILE = "sm.json";

const REGISTRY_URL = "https://unpkg.com/";

const defaultStripKeys = {
  library: ["_id", "package"],
  framework: ["files"],
};

module.exports = {
  libraries,
  defaultStripKeys,
  SUPPORTED_FRAMEWORKS,
  REGISTRY_URL,
  SM_CONFIG_FILE,
  SM_FILE,
};
