const { vol, createFsFromVolume } = jest.requireActual("memfs");
const newFs = createFsFromVolume(vol);
// The following is needed due to rmSync not existing on memfs
// Github issue link on fs-monkey: https://github.com/streamich/fs-monkey/issues/320
newFs["rmSync"] = vol["rmSync"].bind(vol);
newFs["realpathSync"] = vol["realpathSync"].bind(vol);

module.exports = newFs;
