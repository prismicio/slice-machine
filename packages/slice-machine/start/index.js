#!/usr/bin/env node

const path = require("path");
const pkg = require("../package.json");

const { Utils } = require("slicemachine-core");
const moduleAlias = require("module-alias");

const LIB_PATH = path.join(__dirname, "..", "build", "lib");

Object.entries(pkg._moduleAliases).forEach(([key]) => {
  moduleAlias.addAlias(key, (fromPath) => {
    return path.join(path.relative(path.dirname(fromPath), LIB_PATH));
  });
});

global.fetch = require("node-fetch");
const fs = require("fs");

const boxen = require("boxen");
const spawn = require("child_process").spawn;
const migrate = require("../changelog/migrate");

const validate = require("../build/lib/env/client").validate;

const infobox = require("./info");

const compareVersions = require("../build/lib/env/semver").default;
const {
  default: handleManifest,
  ManifestStates,
} = require("../build/lib/env/manifest");

const { argv } = require("yargs");

async function handleChangelog(params) {
  try {
    await migrate(false, params);
  } catch (e) {
    console.error(
      "An error occurred while migrating file system. Continuing..."
    );
    console.error(`Full error: ${e}`);
    return;
  }
}

async function handleMigration(cwd) {
  const pathToPkg = path.join(cwd, "package.json");
  const pathToSmFile = path.join(cwd, "sm.json");
  if (!fs.existsSync(pathToSmFile)) {
    return;
  }

  return handleChangelog({ cwd, pathToPkg, pathToSmFile });
}

function start({ cwd, port }, callback) {
  const smServer = spawn("node", ["../build/server/src/index.js"], {
    cwd: __dirname,
    port,
    env: {
      ...process.env,
      CWD: cwd,
      PORT: port,
    },
  });

  smServer.stdout.on("data", function (data) {
    const lns = data.toString().split("=");
    if (lns.length === 2) {
      // server was launched
      if (callback) {
      }
      callback(lns[1].replace(/\\n/, "").trim());
    } else {
      console.log(data.toString());
    }
  });

  smServer.stderr.on("data", function (data) {
    console.log("[slice-machine] " + data.toString());
  });
}

async function handleManifestState(manifestState, cwd) {
  if (manifestState.state !== ManifestStates.Valid) {
    console.log(
      boxen(
        `🔴 A configuration error was detected!
        
Error Message:
"${manifestState.message}"

See below for more info 👇`,
        { padding: 1, borderColor: "red" }
      )
    );

    console.log("\n--- ℹ️  How to solve this: ---\n");
  }

  switch (manifestState.state) {
    case ManifestStates.Valid:
      return { exit: false };
    case ManifestStates.NotFound: {
      console.log(
        `Run ${Utils.bold(
          `"${Utils.CONSTS.INIT_COMMAND}"`
        )} command to configure your project`
      );

      return { exit: true };
    }
    case ManifestStates.MissingEndpoint:
      console.log(
        'Add a property "apiEndpoint" to your config.\nExample: https://my-repo.prismic.io/api/v2\n\n'
      );
      return { exit: true };
    case ManifestStates.InvalidEndpoint:
      console.log(
        "Update your config file with a valid Prismic endpoint.\nExample: https://my-repo.prismic.io/api/v2\n\n"
      );
      return { exit: true };
    case ManifestStates.InvalidJson: {
      console.log("Update your config file with a valid JSON structure.");
      return { exit: true };
    }
    default: {
      return { exit: false };
    }
  }
}

async function run() {
  const cwd = process.cwd(); // project running the script

  const port = argv.p || argv.port || "9999";
  if (!argv.skipMigration) {
    await handleMigration(cwd);
  }

  const nodeVersion = process.version.slice(1).split(".")[0];
  if (parseInt(nodeVersion) < 12) {
    console.error(
      `\n🔴 Slicemachine requires node version >= 12 to work properly.\nCurrent version: ${process.version}\n`
    );
    process.exit(-1);
  }

  const userConfig = handleManifest(cwd);
  const { exit } = await handleManifestState(userConfig, cwd);
  if (exit) {
    console.log("");
    process.exit(0);
  }

  const SmDirectory = path.resolve(__dirname, ".."); // directory of the module
  const npmCompareData = await compareVersions({ cwd: SmDirectory }, false);

  const framework = Utils.Framework.defineFramework(userConfig.content, cwd);

  const validateRes = await validate();

  start({ cwd, port }, (url) => {
    const email =
      validateRes && validateRes.body ? validateRes.body.email : null;
    infobox(npmCompareData, url, framework, email);
  });
}

main();
async function main() {
  try {
    run();
  } catch (err) {
    console.error(`[slice-machine] An unexpected error occurred. Exiting...`);
    console.log("Full error: ", err);
  }
}
