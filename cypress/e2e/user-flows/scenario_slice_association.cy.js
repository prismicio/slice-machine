const customTypeName = "My Test";
const customTypeId = "my_test";

const sliceName = "TestSlice";
const sliceId = "test_slice"; // generated automatically from the slice name
const sliceLib = "slices";

describe("I am an existing SM user (Next) and I want to associate a Slice to a CT and review my experience.", () => {
  before(() => {
    cy.clearProject();
  });

  beforeEach(() => {
    cy.setSliceMachineUserContext({});
  });

  it("Create a Custom type with multiple fields", () => {
    cy.createCustomType(customTypeId, customTypeName);
    cy.addFieldToCustomType("UID", "ID Field", "uid", true);
    cy.addFieldToCustomType("Key Text", "Key Text Field", "key_text_id");
    cy.addFieldToCustomType("Rich Text", "Rich Text Field", "rich_text_id");
  });

  it("Create a Slice with multiple fields (repeatable and non-repeatable)", () => {
    cy.createSlice(sliceLib, sliceId, sliceName);

    // clear the Slice
    cy.get('[data-cy="slice-menu-button"]').each(($element) => {
      cy.wrap($element).click();
      cy.contains("Delete field").click();
    });

    cy.addStaticFieldToSlice(
      "Key Text",
      "Static Key Text Field",
      "static_key_text_id",
      true
    );

    cy.addStaticFieldToSlice(
      "Rich Text",
      "Statuc Rich Text Field",
      "static_rich_text_id"
    );

    cy.addRepeatableFieldToSlice(
      "Rich Text",
      "Repeatable Rich Text Field",
      "repeatable_rich_text_id",
      true
    );

    cy.addRepeatableFieldToSlice(
      "Key Text",
      "Repeatable Key Text Field",
      "repeatable_key_text_id"
    );
  });
});
