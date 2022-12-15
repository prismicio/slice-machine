import { packageJsonFile, manifestFile } from "../../consts";

const customTypeName = "My Test";
const customTypeId = "my_test";

describe("Custom Types specs", () => {
  beforeEach(() => {
    cy.setSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {},
      hasSeenTutorialsTooTip: true,
    });
    cy.clearProject();
  });

  it("A user can create and rename a custom type", () => {
    cy.createCustomType(customTypeId, customTypeName);
    cy.renameCustomType(customTypeId, customTypeName, "New Custom Type Name");
  });

  it("generates types if `generateTypes` is `true` and `@prismicio/types` is installed", () => {
    // Stub manifest.
    cy.readFile(manifestFile).then((manifestContents) => {
      cy.writeFile(manifestFile, { ...manifestContents, generateTypes: true });
    });

    // Stub package.json.
    cy.readFile(packageJsonFile).then((packageJsonContents) => {
      cy.writeFile(packageJsonFile, {
        ...packageJsonContents,
        dependencies: {
          ...packageJsonContents.dependencies,
          "@prismicio/types": "latest",
        },
      });
    });

    cy.createCustomType(customTypeId, customTypeName);
  });
});
