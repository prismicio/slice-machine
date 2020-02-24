const expect = require("expect.js");

/** test LIBRARY model ([PATH_TO_LIB || '.']/sm.json file) */
function expectLibrary(sm) {
  expect(sm).to.be.an("object");

  expect(sm).to.have.property("fieldset");
  expect(sm).to.have.property("description");
  expect(sm).to.have.property("icon");
  expect(sm).to.have.property("display");
  expect(sm).to.have.property("non-repeat");

  expect(sm).to.have.property("slices");

  const slices = sm.slices;
  expect(slices).to.be.an("object");
  Object.values(slices).forEach((value) => {
    expectSliceModel(value)
    expect(value).to.have.property("meta")
    expectMeta(value.meta)
  })

  /**
   * because we spread sm.config in sm.json,
   * we can test sm.json as sm.config
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

/** test SLICE metadata file (SLICE_NAME/meta.json) */
function expectMeta(meta) {
  expect(meta).to.be.an("object");
  expect(meta).to.have.property("title");
  expect(meta).to.have.property("description");
}


module.exports = {
  expectConfig,
  expectLibrary,
  expectMeta,
  expectSliceModel,
};
