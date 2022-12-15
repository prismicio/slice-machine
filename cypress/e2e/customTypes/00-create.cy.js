import { PACKAGE_JSON_FILE, MANIFEST_FILE } from "../../consts";

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
