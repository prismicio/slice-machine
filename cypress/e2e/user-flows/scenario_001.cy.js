const customTypeName = "My Custom Type";
const customTypeId = "my_custom_type";

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
    cy.waitUntil(() => cy.get("[data-cy=get-started]"));
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
    cy.waitUntil(() => cy.get(`[data-cy="empty-zone-add-new-field"]`));

    // TODO: removing this delay will make the test flaky (because of the useServerState hook)
    cy.wait(5000);

    cy.addFieldToCustomType(customTypeId, "UID", "ID Field", "uid", true);
    cy.addFieldToCustomType(
      customTypeId,
      "Key Text",
      "Key Text Field",
      "key_text_id"
    );
    cy.addFieldToCustomType(
      customTypeId,
      "Rich Text",
      "Rich Text Field",
      "rich_text_id"
    );

    cy.get("[data-cy=builder-save-button]").should("not.be.disabled");

    cy.get("[data-cy=builder-save-button]").click();

    cy.get("[data-cy=builder-save-button-spinner]").should("be.visible");

    cy.get("[data-cy=builder-save-button-icon]").should("be.visible");
  });

  it("Pushes changes", () => {
    cy.visit(`/changes`);

    // first page load
    cy.waitUntil(() => cy.get("[data-cy=push-changes]"));

    // number of changes should be one (1 new custom type)
    cy.get("[data-cy=changes-number]").within(() => {
      cy.contains("1").should("be.visible");
    });

    // sync changes button should be enabled
    cy.get("[data-cy=push-changes]").should("be.enabled");

    // click to push changes
    cy.get("[data-cy=push-changes]").click();

    // number of changes should now be 0 and not displayed
    cy.get("[data-cy=changes-number]").should("not.exist");

    // sync changes button should be disabled
    cy.get("[data-cy=push-changes]").should("be.disabled");
  });
});
