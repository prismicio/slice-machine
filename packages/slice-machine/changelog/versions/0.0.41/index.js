// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const glob = require("glob");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const slash = require("slash");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { shouldIRun } = require("../../common");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getInfoFromPath } = require("@slicemachine/core/build/src/utils/lib");

module.exports = {
  version: "0.0.41",
  main: async function main(ignorePrompt, { cwd, pathToSmFile }) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { yes } = ignorePrompt
      ? { yes: true }
      : // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/require-await
        await (async () => {
          console.info(
            "\nSliceMachine nows supports both default and custom previews (screenshots)!"
          );
          console.info(
            "Default screenshots are now stored in a special .slicemachine folder."
          );
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return shouldIRun(
            "Would you like me to move current previews to .slicemachine folder?"
          );
        })();
    if (yes) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (fs.existsSync(pathToSmFile, "utf8")) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          fs.mkdirSync(path.join(cwd, ".slicemachine", "assets"), {
            recursive: true,
          });
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
          const json = JSON.parse(fs.readFileSync(pathToSmFile, "utf-8"));
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          (json.libraries || []).forEach((lib) => {
            const { isLocal, pathExists, pathToSlices } = getInfoFromPath(
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              cwd,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              lib
            );
            if (isLocal && pathExists) {
              const matches = glob.sync(
                `${slash(pathToSlices)}/**/preview.png`
              );
              matches.forEach((match) => {
                const split = match.split(path.posix.sep);
                const sliceName = split[split.length - 2];
                if (sliceName) {
                  const pathToNewFile = path.join(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    cwd,
                    ".slicemachine/assets",
                    split[split.length - 3],
                    sliceName,
                    "preview.png"
                  );
                  fs.mkdirSync(path.dirname(pathToNewFile), {
                    recursive: true,
                  });
                  fs.renameSync(match, pathToNewFile);
                }
              });
            }
          });
        } catch (e) {
          console.log(e);
        }
      }
    }
  },
};
