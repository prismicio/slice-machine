const expect = require("expect.js");

/** test LIBRARY model ([PATH_TO_LIB || '.']/SM_FILE file) */
function expectLibrary(sm) {
  expect(sm).to.be.an("object");

  expect(sm).to.have.property("packageName");
  expect(sm).to.have.property("package");
  expect(sm).to.have.property("slices");

  const slices = sm.slices;
  expect(slices).to.be.an("object");
  Object.values(slices).forEach((value) => {
    expectSliceModel(value)
  })

  /**
   * because we spread sm.config in SM_FILE,
   * we can test SM_FILE as sm.config
   */
  expectConfig(sm)

}

/** test LIBRARY configuration (PATH_TO_LIB/sm.config.json) */
function expectConfig(config) {
  expect(config).to.have.property("libraryName");
  expect(config).to.have.property("gitUrl");
  expect(config).to.have.property("framework");
}

/** test SLICE model (SLICE_NAME/model.json) */
function expectSliceModel(model) {
  expect(model).to.be.an("object");
  expect(model).to.have.property("type", "Slice");
  expect(model).to.have.property("fieldset");
  expect(model).to.have.property("description");
  expect(model).to.have.property("icon");
  expect(model).to.have.property("display");
  expect(model).to.have.property("non-repeat");
}

module.exports = {
  expectConfig,
  expectLibrary,
  expectSliceModel,
};
