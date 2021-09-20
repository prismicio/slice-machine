const fs = require("fs");
const path = require("path");
const consola = require("consola");

const { pascalize } = require("../utils/str");

const { expectSliceModel } = require("../expect");

function pathExists(p, error, read) {
  try {
    if (fs.existsSync(p)) {
      return read ? fs.readFileSync(p, "utf8") : true;
    }
  } catch (err) {
    throw new Error(error);
  }
}

function isJSON(content) {
  try {
    const json = JSON.parse(content);
    return json;
  } catch (e) {
    throw new Error(e);
  }
}

function pathHasType(p, type, error) {
  if (type === "f" || type === "file") {
    return pathExists(p, error);
  }
  const isDirectory = fs.lstatSync(p).isDirectory();
  if (!isDirectory) {
    throw new Error(error);
  }
  return true;
}

function isSliceName(sliceName) {
  let str = "";
  sliceName.split("").forEach((l) => {
    if (l === l.toUpperCase()) {
      return (str += `-${l}`);
    }
    str += l;
  });

  if (pascalize(str).localeCompare(sliceName)) {
    throw new Error(
      `folder ${sliceName} is not PascalCased. Therefore, slice type cannot be infered.\nPlease change it before committing your library definition`
    );
  }
}

function isSliceFolder(p) {
  try {
    pathExists(path.join(p, "preview.png"));
    // const meta = isJSON(pathExists(path.join(p, 'meta.json'), 'File "meta.json" does not exist.', true))
    const model = isJSON(
      pathExists(
        path.join(p, "model.json"),
        'File "model.json" does not exist.',
        true
      )
    );

    expectSliceModel(model);

    return {
      model,
    };
  } catch (e) {
    consola.error(
      `slice-machine/isSliceFolder] Error while parsing slice folder, at path "${path}"`
    );
    consola.error(e);
  }
}

module.exports = {
  isSliceFolder,
  pathExists,
  isJSON,
  isSliceName,
  pathHasType,
};
