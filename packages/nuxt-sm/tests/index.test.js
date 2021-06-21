const logger = require('../src/logger');
logger.mockTypes(() => jest.fn());
const smResolver = require("../src");
const handleLibraryPath = smResolver.handleLibraryPath

const testLibrary = 'vue-essential-slices'

describe("prismic-nuxt module", function() {
  let context;
  let moduleOptions;

  beforeAll(() => consola.wrapAll())
  beforeEach(function() {
    context = {
      _routes: [],
      _resolve: jest.fn(),
      addPlugin: jest.fn(),
      addTemplate: jest.fn(),
      extendRoutes: jest.fn((fn) => {
        fn(context._routes, context._resolve)
      }),
      options: {
        srcDir: '/var/nuxt',
        buildDir: '/var/nuxt/.nuxt/',
        head: {},
        dir: {},
        generate: {},
      },
    }
    moduleOptions = {
      libraries: [testLibrary],
    };
  });

  it("should be defined", function() {
    expect(smResolver).toBeDefined();
  });

  it("should create resolver file", async function() {
    await smResolver.call(context, moduleOptions);
    expect(context.addPlugin.mock.calls[0][0].fileName).toEqual('prismic/sm-resolver.js')
  })

  it("should create import paths", async function () {
    const importString = await handleLibraryPath(testLibrary)
    expect(importString).not.toBe(undefined)
  })

  it("should not import path that does not exist", async function () {
    const lib = '~/imaginary/path'
    const importString = await handleLibraryPath(lib)
    expect(importString).toBe(undefined)
  })

  it("should use user-defined resolver", async function () {
    const expectedSrcPath = 'tests/__mock__/resolver.js'
    await smResolver.call(context, { ...moduleOptions, pathToResolver: expectedSrcPath });
    expect(context.addPlugin.mock.calls[0][0].src).toContain(expectedSrcPath)
  })

  it("should use user-defined sm.json", async function () {
    const expectedImportString = await handleLibraryPath('@/tests/__mock__/slices')
    const pathToSmFile = 'tests/__mock__/sm.json'
    await smResolver.call(context, { pathToSmFile });
    expect(context.addPlugin.mock.calls[0][0].options.imports).toContain(expectedImportString)
  })

});
