function merge(manifest, library) {
  const {
    css = [],
    script = [],
    packageName,
    dependencies = [],
    devDependencies = [],
  } = library;

  return {
    ...manifest,
    devDependencies: [...(manifest.devDependencies || []), ...devDependencies],
    dependencies: [
      ...(manifest.dependencies || []),
      ...dependencies,
      packageName,
    ],
    libraries: [...(manifest.libraries || []), packageName],
    css: [...(manifest.css || []), ...css],
    script: [...(manifest.script || []), ...script],
  };
}

module.exports = {
  merge,
};
