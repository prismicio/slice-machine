// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const prompts = require("prompts");

async function selectRepo(repositories) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const response = await prompts({
    type: "select",
    name: "repo",
    message: "Pick a Prismic project",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    choices: repositories.map(([repo]) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      title: repo,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      value: repo,
    })),
    initial: 1,
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return response.repo;
}

async function shouldOnboard() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const response = await prompts({
    type: "confirm",
    name: "confirm",
    message: "Would you like to setup the Slicemachine plugin?",
    initial: true,
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return response.confirm;
}

async function createManifest(cwd) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const response = await prompts({
    type: "confirm",
    name: "confirm",
    message: "Can I create a manifest file for you?",
    initial: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!response.confirm) {
    console.log("Please create an sm.json file at the root of your project");
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
