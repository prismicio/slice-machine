import { snakelize } from "./utils/str";
import uniqid from "uniqid";
import Files from "./utils/files";
import { CustomPaths } from "./models/paths";

const migrate = (model, info, env, write = true) => {
  const { type, fieldset, "non-repeat": nonRepeat = {}, repeat = {} } = model;
  if (type !== "Slice") {
    return { model, migrated: false };
  }
  const newModel = {
    id: snakelize(info.sliceName),
    type: "SharedSlice",
    name: info.sliceName,
    description: fieldset,
    variations: [
      {
        id: "default-slice",
        name: "Default slice",
        docURL: "...",
        version: uniqid(),
        description: fieldset,
        primary: nonRepeat,
        items: repeat,
      },
    ],
  };

  if (write) {
    const modelPath = CustomPaths(env.cwd)
      .library(info.from)
      .slice(info.sliceName)
      .model();
    Files.write(modelPath, newModel);
  }

  return { model: newModel, migrated: true };
};

export default migrate;
