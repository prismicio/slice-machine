import * as Widgets from '../lib/widgets'

const WidgetsTable = Object.entries(Widgets)

test.each(WidgetsTable)('%s: can create mock', (name, widget) => {
  expect(widget).toMatchObject({
    createMock: expect.any(Function),
  })
});

test.each(WidgetsTable)('%s: schema validates configuration', (name, widget) => {
  const { schema } = widget
  if (!schema) {
    return
  }
  const tests = require(`./__mockData__/widgets/${name}`)
  Object.entries(tests).forEach(([testName, t]) => {
    try {
      const a = schema.validateSync(t)
      expect(a.__pass).toBe(true)
    } catch(e) {
      expect(t.__pass).toBe(false)
    }
  })
});