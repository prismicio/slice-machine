import path from "path";

describe("I am a new SM user (with Next) who wants to create a Custom Type with fields, and then save and push it to Prismic.", () => {
  const name = "My Custom Type";
  const id = "my_custom_type";
  const appPath = path.join("e2e-projects", "cypress-next-app");

  before(() => {
    cy.log("Clearing local storage and remove existing CT/slices");
    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
    cy.task("clearDir", path.join(appPath, "customtypes"));
    cy.task("clearDir", path.join(appPath, "slices"));
    cy.task("clearDir", path.join(appPath, ".slicemachine"));
  });

  it("Complete onboarding steps", () => {
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
    cy.setupSliceMachineUserContext();
    cy.visit("/");
    cy.waitUntil(() => cy.get("[data-cy=empty-state-main-button]"));

    cy.get("[data-cy=empty-state-main-button]").click();
    cy.get("[data-cy=create-ct-modal]").should("be.visible");

    cy.get("input[data-cy=repeatable-type-radio-btn]").should("be.checked");
    cy.get("input[data-cy=single-type-radio-btn]").should("not.be.checked");

    cy.get("input[data-cy=ct-name-input]").clear().type(name);
    cy.get("input[data-cy=ct-id-input]").should("have.value", id);

    cy.get("[data-cy=create-ct-modal]").submit();
    cy.location("pathname", { timeout: 15000 }).should("eq", `/cts/${id}`);
  });

  it("Adding fields to repeatable CT & saving", () => {
    cy.setupSliceMachineUserContext();
    cy.visit(`/cts/${id}`);
    cy.waitUntil(() => cy.get('[data-testid="empty-zone-add-new-field"]'));

    // Add UID
    cy.get('[data-testid="empty-zone-add-new-field"]').first().click();
    cy.get("[data-cy=UID]").click();

    cy.get("[data-cy=new-field-name-input]").clear().type("ID Field");

    cy.get("[data-cy=new-field-id-input]").should("have.value", "uid");
    cy.get("[data-cy=new-field-id-input]").should("be.disabled");

    cy.get("[data-cy=new-field-form]").submit();
    cy.get("[data-cy=ct-static-zone]").within(() => {
      cy.contains("ID Field").should("be.visible");
      cy.contains("data.uid").should("be.visible");
    });

    // Add Key Text
    cy.get('[data-cy="add-new-field"]').first().click();
    cy.get("[data-cy='Key Text']").click();

    cy.get("[data-cy=new-field-name-input]").clear().type("Key Text Field");

    cy.get("[data-cy=new-field-id-input]").should(
      "have.value",
      "key_text_field"
    );
    cy.get("[data-cy=new-field-id-input]").clear().type("key_text_id");

    cy.get("[data-cy=new-field-form]").submit();
    cy.get("[data-cy=ct-static-zone]").within(() => {
      cy.contains("Key Text Field").should("be.visible");
      cy.contains("data.key_text_id").should("be.visible");
    });

    // Add Rich Text
    cy.get('[data-cy="add-new-field"]').first().click();
    cy.get("[data-cy='Rich Text']").click();

    cy.get("[data-cy=new-field-name-input]").clear().type("Rich Text Field");

    cy.get("[data-cy=new-field-id-input]").should(
      "have.value",
      "rich_text_field"
    );
    cy.get("[data-cy=new-field-id-input]").clear().type("rich_text_id");

    cy.get("[data-cy=new-field-form]").submit();
    cy.get("[data-cy=ct-static-zone]").within(() => {
      cy.contains("Rich Text Field").should("be.visible");
      cy.contains("data.rich_text_id").should("be.visible");
    });

    cy.get("[data-cy=ct-builder-primary-button]").within(() => {
      cy.contains("Save to File System").should("be.visible");
    });

    cy.get("[data-cy=ct-builder-primary-button]").click();

    cy.get("[data-cy=ct-builder-primary-button]").within(() => {
      cy.contains("Push to Prismic").should("be.visible");
    });
  });

  it("Push custom type", () => {
    cy.setupSliceMachineUserContext();
    cy.visit(`/cts/${id}`);
    cy.waitUntil(() => cy.get('[data-cy=ct-builder-primary-button"]'));

    cy.get("[data-cy=ct-builder-primary-button]").within(() => {
      cy.contains("Push to Prismic").should("be.visible");
    });

    cy.get("[data-cy=ct-builder-primary-button]").click();

    cy.get("[data-cy=ct-builder-primary-button]").within(() => {
      cy.contains("Synced with Prismic").should("be.visible");
    });
  });
});
