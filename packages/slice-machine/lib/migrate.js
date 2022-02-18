import { snakelize } from "./utils/str";
import uniqid from "uniqid";
import Files from "./utils/files";
import { CustomPaths } from "./models/paths";

const migrate = (model, info, env, write = true) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { type, fieldset, "non-repeat": nonRepeat = {}, repeat = {} } = model;
  if (type !== "Slice") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { model, migrated: false };
  }
  const newModel = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    id: snakelize(info.sliceName),
    type: "SharedSlice",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    name: info.sliceName,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    description: fieldset,
    variations: [
      {
        id: "default-slice",
        name: "Default slice",
        docURL: "...",
        version: uniqid(),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        description: fieldset,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        primary: nonRepeat,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        items: repeat,
      },
    ],
  };

  if (write) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const modelPath = CustomPaths(env.cwd)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      .library(info.from)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      .slice(info.sliceName)
      .model();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Files.write(modelPath, newModel);
  }

  return { model: newModel, migrated: true };
};

export default migrate;
