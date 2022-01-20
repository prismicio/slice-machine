#!/usr/bin/env node

const nodeVersion = process.version.slice(1).split(".")[0];
if (parseInt(nodeVersion) < 12) {
  console.error(
    `🔴 Slicemachine requires node version >= 12 to work properly.\nCurrent version: ${process.version}\n`
  );
  process.exit(-1);
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../package.json");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Utils, Models } = require("@slicemachine/core");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const moduleAlias = require("module-alias");

const LIB_PATH = path.join(__dirname, "..", "build", "lib");

Object.entries(pkg._moduleAliases).forEach(([key]) => {
  moduleAlias.addAlias(key, (fromPath) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return path.join(path.relative(path.dirname(fromPath), LIB_PATH));
  });
});

global.fetch = require("node-fetch");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const boxen = require("boxen");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const spawn = require("child_process").spawn;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const migrate = require("../changelog/migrate");
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const validateUserAuth =
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
  require("../build/server/src/api/services/validateUserAuth").validateUserAuth;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const infobox = require("./info");

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
const compareVersions = require("../build/lib/env/semver").default;
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const {
  default: handleManifest,
  ManifestState,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("../build/lib/env/manifest");

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const { argv } = require("yargs");

async function handleChangelog(params) {
  try {
    await migrate(false, params);
  } catch (e) {
    console.error(
      "An error occurred while migrating file system. Continuing..."
    );
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`Full error: ${e}`);
    return;
  }
}

async function handleMigration(cwd) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const pathToPkg = path.join(cwd, "package.json");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const pathToSmFile = path.join(cwd, "sm.json");
  if (!fs.existsSync(pathToSmFile)) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return handleChangelog({ cwd, pathToPkg, pathToSmFile });
}

function start({ cwd, port }, callback) {
  const smServer = spawn("node", ["../build/server/src/index.js"], {
    cwd: __dirname,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    port,
    env: {
      ...process.env,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
      CWD: cwd,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      PORT: port,
      SEGMENT_WRITE_KEY: "JfTfmHaATChc4xueS7RcCBsixI71dJIJ",
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  smServer.stdout.on("data", function (data) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const lns = data.toString().split("Server running");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    if (lns.length === 2) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      callback(lns[1].replace(/\\n/, "").trim());
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      console.log(data.toString());
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  smServer.stderr.on("data", function (data) {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    console.log("[slice-machine] " + data.toString());
  });
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/require-await
async function handleManifestState(manifestState) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (manifestState.state !== ManifestState.Valid) {
    console.log(
      boxen(
        `🔴 A configuration error was detected!

Error Message:
"${
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
          manifestState.message
        }"

See below for more info 👇`,
        { padding: 1, borderColor: "red" }
      )
    );

    console.log("\n--- ℹ️  How to solve this: ---\n");
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  switch (manifestState.state) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    case ManifestState.Valid:
      return { exit: false };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    case ManifestState.NotFound: {
      console.log(
        `Run ${Utils.bold(
          `"${Utils.CONSTS.INIT_COMMAND}"`
        )} command to configure your project`
      );

      return { exit: true };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    case ManifestState.MissingEndpoint:
      console.log(
        'Add a property "apiEndpoint" to your config.\nExample: https://my-repo.prismic.io/api/v2\n\n'
      );
      return { exit: true };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    case ManifestState.InvalidEndpoint:
      console.log(
        "Update your config file with a valid Prismic endpoint.\nExample: https://my-repo.prismic.io/api/v2\n\n"
      );
      return { exit: true };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    case ManifestState.InvalidJson: {
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const manifestInfo = handleManifest(cwd);
  const { exit } = await handleManifestState(manifestInfo);
  if (exit) {
    console.log("");
    process.exit(0);
  }

  const SmDirectory = path.resolve(__dirname, ".."); // directory of the module
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const npmCompareData = await compareVersions({ cwd: SmDirectory });

  const framework = Utils.Framework.defineFramework(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    manifestInfo.content,
    cwd,
    Models.SupportedFrameworks
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const validateRes = await validateUserAuth();

  start({ cwd, port }, (url) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const email =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      validateRes && validateRes.body ? validateRes.body.email : null;
    infobox(npmCompareData, url, framework, email);
  });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
// eslint-disable-next-line @typescript-eslint/require-await
async function main() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    run();
  } catch (err) {
    console.error(`[slice-machine] An unexpected error occurred. Exiting...`);
    console.log("Full error: ", err);
  }
}
