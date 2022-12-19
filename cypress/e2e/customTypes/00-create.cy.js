describe("Custom Types specs", () => {
  const root = "e2e-projects/cypress-next-app";
  const packageJson = `${root}/package.json`;
  const manifest = `${root}/sm.json`;
  const type = `${root}/.slicemachine/prismicio.d.ts`;
  const name = "My Test";
  const id = "my_test";
  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
    cy.task("clearDir", `${root}/customtypes`);
    cy.task("clearDir", `${root}/.slicemachine`);
  });

  it("A user can create and rename a custom type", () => {
    cy.setupSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {},
      hasSeenTutorialsTooTip: true,
      hasSeenSimulatorToolTip: false,
    });
    cy.visit("/");

    // loading spinner
    cy.waitUntil(() => cy.get("[data-cy=empty-state-main-button]")).then(
      () => true
    );

    //create custom type
    cy.get("[data-cy=empty-state-main-button]").click();
    cy.get("[data-cy=create-ct-modal]").should("be.visible");

    cy.get("input[data-cy=ct-name-input]").type(name);
    cy.get("[data-cy=create-ct-modal]").submit();
    cy.location("pathname", { timeout: 15000 }).should("eq", `/cts/${id}`);
    cy.readFile(type).should("contains", name);

    //edit custom type name
    cy.get('[data-cy="edit-custom-type"]').click();
    cy.get("[data-cy=rename-custom-type-modal]").should("be.visible");
    cy.get('[data-cy="custom-type-name-input"]').should("have.value", name);
    cy.get('[data-cy="custom-type-name-input"]')
      .clear()
      .type(`${name} - Edited`);
    cy.get("[data-cy=rename-custom-type-modal]").submit();
    cy.get("[data-cy=rename-custom-type-modal]").should("not.exist");
    cy.get('[data-cy="custom-type-secondary-breadcrumb"]').contains(
      `/ ${name} - Edited`
    );
    cy.readFile(type).should("contains", `${name} - Edited`);

    // add a tab
    cy.contains("Add Tab").click();
    cy.getInputByLabel("New Tab ID").type("Foo");
    cy.get("#create-tab").contains("Save").click();
    // rename the tab with spaces
    cy.contains("Foo").click();
    cy.getInputByLabel("Update Tab ID").type("Foo Bar ");
    cy.get("#create-tab").contains("Save").click();
    // save
    cy.contains("Save to File System").click();
    // check that the space has been trimmed
    cy.wait(1000);
    const pathToFModel = `${root}/customtypes/${id}/index.json`;
    cy.readFile(pathToFModel, "utf-8")
      .its("json")
      .should("have.a.property", "Foo Bar")
      .should("not.have.a.property", "Foo Bar ");
  });

  it("generates types if `generateTypes` is `true` and `@prismicio/types` is installed", () => {
    // Stub manifest.
    cy.readFile(manifest).then((manifestContents) => {
      cy.writeFile(manifest, { ...manifestContents, generateTypes: true });
    });

    // Stub package.json.
    cy.readFile(packageJson).then((packageJsonContents) => {
      cy.writeFile(packageJson, {
        ...packageJsonContents,
        dependencies: {
          ...packageJsonContents.dependencies,
          "@prismicio/types": "latest",
        },
      });
    });

    cy.setupSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {},
      hasSeenTutorialsTooTip: true,
      hasSeenSimulatorToolTip: false,
    });
    cy.visit("/");

    // loading spinner
    cy.waitUntil(() => cy.get("[data-cy=empty-state-main-button]")).then(
      () => true
    );

    //create custom type
    cy.get("[data-cy=empty-state-main-button]").click();
    cy.get("[data-cy=create-ct-modal]").should("be.visible");

    cy.get("input[data-cy=ct-name-input]").type(name);
    cy.get("[data-cy=create-ct-modal]").submit();
    cy.location("pathname", { timeout: 15000 }).should("eq", `/cts/${id}`);
    cy.readFile(type).should("contains", name);
  });
});
