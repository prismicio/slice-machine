const prismic = require("@prismicio/client");

const sm = require("./sm.json");

/**
 * @returns {import('next').NextConfig}
 */
module.exports = async () => {
  const client = prismic.createClient(sm.apiEndpoint);

  const repository = await client.getRepository();
  const locales = repository.languages.map((lang) => lang.id);

  return {
    reactStrictMode: false, // TODO: re-enable React's strict mode once we understand the problem with Slice Simulator.
    i18n: {
      // These are all the locales you want to support in
      // your application
      locales,
      // This is the default locale you want to be used when visiting
      // a non-locale prefixed path e.g. `/hello`
      defaultLocale: locales[0],
    },
    images: {
      loader: "imgix",
      path: "",
    },
  };
};