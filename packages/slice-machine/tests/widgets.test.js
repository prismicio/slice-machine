import * as Widgets from '../lib/widgets'

const WidgetsTable = Object.entries(Widgets)

test.each(WidgetsTable)('Test widget %s', (name, widget) => {
  expect(widget).toMatchObject({
    createMock: expect.any(Function),
  })
});