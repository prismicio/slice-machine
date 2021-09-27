const fs = require("fs");
const path = require("path");
const prompts = require("prompts");

async function selectRepo(repositories) {
  const response = await prompts({
    type: "select",
    name: "repo",
    message: "Pick a Prismic project",
    choices: repositories.map(([repo]) => ({
      title: repo,
      value: repo,
    })),
    initial: 1,
  });
  return response.repo;
}

async function shouldOnboard() {
  const response = await prompts({
    type: "confirm",
    name: "confirm",
    message: "Would you like to setup the Slicemachine plugin?",
    initial: true,
  });
  return response.confirm;
}

async function createManifest(cwd) {
  const response = await prompts({
    type: "confirm",
    name: "confirm",
    message: "Can I create a manifest file for you?",
    initial: true,
  });

  if (!response.confirm) {
    console.log("Please create an sm.json file at the root of your project");
    return true;
  }

  const pathToSmFile = path.join(cwd, "sm.json");
  fs.writeFileSync(
    pathToSmFile,
    JSON.stringify(
      {
        apiEndpoint: "https://update-me.prismic.io/api/v2",
        libraries: ["~/slices"],
      },
      null,
      2
    )
  );

  console.log(
    "File created!\nYou'll need to update it with a valid Prismic API endpoint!"
  );
  return true;
}

module.exports = {
  createManifest,
  selectRepo,
  shouldOnboard,
};
