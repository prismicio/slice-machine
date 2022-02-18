import * as Widgets from "@models/common/widgets";

const WidgetsTable = Object.entries(Widgets);

const validate = (widget, t, log) => {
  const { err } = (() => {
    try {
      return { res: widget.schema.validateSync(t, { stripUnknown: false }) };
    } catch (err) {
      return { err };
    }
  })();

  if (err) {
    if (log && t.__pass !== false) {
      console.log({
        passed: false,
        __pass: t.__pass,
        err,
        log,
        t,
      });
    }
    expect(t.__pass).toBe(false);
  } else {
    if (log && t.__pass !== true) {
      console.log({
        passed: true,
        __pass: t.__pass,
        log,
        t,
      });
    }
    expect(t.__pass).toBe(true);
  }
};

test.each(WidgetsTable)(
  "%s: schema validates configuration",
  (name, widget) => {
    const defaultWidget = widget.create();
    expect(function () {
      widget.schema.validateSync(defaultWidget, { stripUnknown: false });
    }).not.toThrow();

    const tests = require(`../__mocks__/widgets/${name}`);
    Object.entries(tests).forEach(([testName, t]) => {
      validate(widget, t); //, name === 'GeoPoint' && testName)
    });
  }
);
