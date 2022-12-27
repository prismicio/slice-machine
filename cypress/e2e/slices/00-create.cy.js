import path from "path";

import { MANIFEST_FILE, ROOT, SLICE_MOCK_FILE } from "../../consts";

const sliceName = "TestSlice";
const editedSliceName = "EditedSliceName";
const sliceId = "test_slice"; // generated automatically from the slice name
const lib = "slices";

describe("Create Slices", () => {
  beforeEach(() => {
    cy.setSliceMachineUserContext({});
    cy.clearProject();
  });

  // TODO: understand why this test is now flaky.
  it.skip("A user can create and rename a slice", () => {
    cy.createSlice(lib, sliceId, sliceName);

    // remove widget
    cy.get('[data-cy="slice-menu-button"]').first().click();
    cy.contains("Delete field").click();
    cy.get('[data-cy="builder-save-button"]').should("not.be.disabled");

    cy.renameSlice(lib, sliceName, editedSliceName);

    // add a variation

    cy.get("button").contains("Default").click();
    cy.contains("+ Add new variation").click();

    cy.getInputByLabel("Variation name*").type("foo");
    cy.getInputByLabel("Variation ID*").clear();
    cy.getInputByLabel("Variation ID*").type("bar");

    cy.get("#variation-add").submit();
    cy.location("pathname", { timeout: 20000 }).should(
      "eq",
      `/${lib}/${editedSliceName}/bar`
    );
    cy.get("button").contains("foo").click();
    cy.contains("Default").click();
    cy.location("pathname", { timeout: 20000 }).should(
      "eq",
      `/${lib}/${editedSliceName}/default`
    );

    cy.contains("Save to File System").click();

    // simulator

    cy.fixture("slice-simulator.jsx", "utf-8").then((file) => {
      const pathToFile = path.join(ROOT, "pages", "slice-simulator.jsx");
      return cy.writeFile(pathToFile, file);
    });

    cy.readFile(MANIFEST_FILE, "utf-8").then((json) => {
      const data = {
        ...json,
        localSliceSimulatorURL: "http://localhost:3000/slice-simulator",
      };
      return cy.writeFile(MANIFEST_FILE, JSON.stringify(data, null, 2));
    });

    // stub window and set target to self
    cy.on("window:before:load", (win) => {
      cy.stub(win, "open").callsFake((url) => {
        return win.open.wrappedMethod.call(win, url, "_self");
      });
    });

    cy.get("[data-testid=simulator-open-button]").click();

    cy.getInputByLabel("Description").first().clear();
    cy.getInputByLabel("Description").first().type("👋");

    cy.get("[data-cy=save-mock]").click();

    cy.wait(1000);

    cy.get("button").contains("Default").click();
    cy.contains("foo").click();

    cy.wait(1000);

    cy.getInputByLabel("Description").first().clear();
    cy.getInputByLabel("Description").first().type("🎉");

    cy.get("[data-cy=save-mock]").click();

    cy.wait(1000);

    cy.get("button").contains("foo").click();
    cy.contains("Default").click();

    cy.readFile(SLICE_MOCK_FILE(sliceId), "utf-8")
      .its(0)
      .its("primary.description.value")
      .its(0)
      .its("content.text")
      .should("equal", "👋");
    cy.readFile(SLICE_MOCK_FILE(sliceId), "utf-8")
      .its(1)
      .its("primary.description.value")
      .its(0)
      .its("content.text")
      .should("equal", "🎉");
  });
});
