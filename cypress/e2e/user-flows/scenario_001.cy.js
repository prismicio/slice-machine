const random = Date.now();

const customTypeName = `My Custom Type ${random}`;
const customTypeId = `my_custom_type_${random}`;

describe("I am a new SM user (with Next) who wants to create a Custom Type with fields, and then save and push it to Prismic.", () => {
  before(() => {
    cy.clearProject();
  });

  beforeEach(() => {
    cy.setSliceMachineUserContext({});
  });

  it("Complete onboarding steps", () => {
    cy.setSliceMachineUserContext({ isOnboarded: false });

    cy.visit("/");
    cy.location("pathname", { timeout: 5000 }).should("eq", "/onboarding");

    cy.get("[data-cy=get-started]").click();
    cy.contains("Build Slices").should("be.visible");

    cy.get("[data-cy=continue]").click();
    cy.contains("Create Page Types").should("be.visible");

    cy.get("[data-cy=continue]").click();
    cy.contains("Push your pages to Prismic").should("be.visible");

    cy.get("[data-cy=continue]").click();
    cy.location("pathname", { timeout: 5000 }).should("eq", "/");
  });

  it("Create a first repeatable CT", () => {
    cy.createCustomType(customTypeId, customTypeName);
  });

  it("Adding fields to repeatable CT & saving", () => {
    cy.visit(`/cts/${customTypeId}`);

    cy.addFieldToCustomType("UID", "ID Field", "uid");
    cy.addFieldToCustomType("Key Text", "Key Text Field", "key_text_id");
    cy.addFieldToCustomType("Rich Text", "Rich Text Field", "rich_text_id");
    cy.saveCustomTypeModifications();
  });

  it("Pushes changes", () => {
    cy.pushLocalChanges(1);
  });
});
