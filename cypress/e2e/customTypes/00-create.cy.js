import {
  CUSTOM_TYPE_MODEL,
  PACKAGE_JSON_FILE,
  MANIFEST_FILE,
} from "../../consts";

const customTypeName = "My Test";
const customTypeId = "my_test";

describe("Custom Types specs", () => {
  beforeEach(() => {
    cy.setSliceMachineUserContext({});
    cy.clearProject();
  });

  it("A user can create and rename a custom type", () => {
    cy.createCustomType(customTypeId, customTypeName);
    cy.renameCustomType(customTypeId, customTypeName, "New Custom Type Name");
    // add a tab
    cy.contains("Add Tab").click();
    cy.getInputByLabel("New Tab ID").type("Foo");
    cy.get("#create-tab").contains("Save").click();
    cy.wait(500);
    // rename the tab with spaces
    cy.contains("Foo").find("button").click();
    cy.getInputByLabel("Update Tab ID").type("Foo Bar ");
    cy.get("#create-tab").contains("Save").click();

    // save
    cy.contains("Save to File System").click();

    // check that the space has been trimmed
    cy.wait(1000);
    cy.readFile(CUSTOM_TYPE_MODEL(customTypeId), "utf-8")
      .its("json")
      .should("have.a.property", "Foo Bar")
      .should("not.have.a.property", "Foo Bar ");
  });

  it("generates types if `generateTypes` is `true` and `@prismicio/types` is installed", () => {
    cy.modifyFile(MANIFEST_FILE, (manifestContents) => ({
      ...manifestContents,
      generateTypes: true,
    }));
    cy.modifyFile(PACKAGE_JSON_FILE, (packageJsonContents) => ({
      ...packageJsonContents,
      dependencies: {
        ...packageJsonContents.dependencies,
        "@prismicio/types": "latest",
      },
    }));
    cy.createCustomType(customTypeId, customTypeName);
  });
});
