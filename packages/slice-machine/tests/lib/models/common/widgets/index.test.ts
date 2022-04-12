import * as Widgets from "@lib/models/common/widgets";

const widgetEntries = Object.entries(Widgets);

describe("Widgets", () => {
  test.each(widgetEntries)(
    "%s: schema validates configuration of newly created fields",
    (name, widget) => {
      expect(widget).toBeDefined();
      expect(widget).not.toBeNull();

      const field = widget?.create(name);
      expect(field).toBeDefined();

      expect(
        widget?.schema.isValidSync(
          {
            type: field?.type,
            config: field?.config,
          },
          { stripUnknown: true }
        )
      ).toBeTruthy();
    }
  );
});
