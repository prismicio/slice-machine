/**
 ** Directly adapted from
 ** https://github.com/mjackson/unpkg/blob/master/modules/utils/parsePackagePathname.js
 ** Example:
 *  - packageName: vue-essential-slices
 *  - packageVersion: latest
 *  - packageSpec: vue-essential-slices@latest
 *  - filename: index.js
 */
function parsePackagePathname(pathname) {
  const packagePathnameFormat = /^((?:@[^/@]+\/)?[^/@]+)(?:@([^/]+))?(\/.*)?$/;
  const match = packagePathnameFormat.exec(pathname);

  if (match == null) {
    return null;
  }

  const packageName = match[1];
  const packageVersion = match[2] || "latest";
  const filename = (match[3] || "").replace(/\/\/+/g, "/");

  return {
    packageName,
    packageVersion,
    packageSpec: `${packageName}@${packageVersion}`,
    filename: filename || "index.js",
  };
}

module.exports = {
  parsePackagePathname,
};
