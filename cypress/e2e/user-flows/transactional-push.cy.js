import { SlicePage } from "../../pages/slices/slicePage";
import { Menu } from "../../pages/Menu";

describe("I am an existing SM user and I want to push local changes", () => {
  const random = Date.now();

  const slice = {
    id: `test_push${random}`,
    name: `TestPush${random}`,
    library: "slices",
  };

  const customType = {
    id: `push_ct_${random}`,
    name: `Push CT ${random}`,
  };

  function mockPushLimit(limitType, customTypesInPush) {
    cy.intercept("POST", "/api/push-changes", {
      statusCode: 200,
      body: {
        type: limitType,
        details: {
          customTypes: customTypesInPush,
        },
      },
    });
  }

  function unmockPushLimit() {
    cy.intercept("POST", "/api/push-changes", (req) => {
      req.continue();
    });
  }

  function mockPushError(statusCode) {
    cy.intercept("POST", "/api/push-changes", {
      statusCode: statusCode,
      body: null,
    });
  }

  beforeEach("Start from the Slice page", () => {
    cy.clearProject();
    cy.setSliceMachineUserContext({});
  });

  it("Creates, updates and deletes slices and custom types", () => {
    cy.createSlice(slice.library, slice.id, slice.name);
    cy.createCustomType(customType.id, customType.name);

    const menu = new Menu();
    const slicePage = new SlicePage();

    menu.navigateTo("Changes");

    cy.pushLocalChanges();

    // Update CT (add tab)
    cy.visit(`/cts/${customType.id}`);
    // add a tab
    cy.contains("Add Tab").click();
    cy.getInputByLabel("New Tab ID").type("Foo");
    cy.get("#create-tab").contains("Save").click();
    cy.contains("Save to File System").click();

    // Update Slice (add variation)
    slicePage.goTo(slice.library, slice.name);
    cy.get("button").contains("Default").click();
    cy.contains("+ Add new variation").click();
    cy.getInputByLabel("Variation name*").type("foo");
    cy.getInputByLabel("Variation ID*").clear();
    cy.getInputByLabel("Variation ID*").type("bar");
    cy.get("#variation-add").submit();
    slicePage.save();

    menu.navigateTo("Changes");

    cy.pushLocalChanges(2);

    // Delete the custom type
    menu.navigateTo("Custom Types");
    cy.get("[data-cy='edit-custom-type-menu']").click();
    cy.contains("Delete").click();
    cy.get("[aria-modal]");
    cy.contains("button", "Delete").click();

    // Delete the slice
    menu.navigateTo("Slices");
    cy.get("[data-cy='slice-action-icon']").click();
    cy.contains("Delete").click();
    cy.get("[aria-modal]");
    cy.contains("button", "Delete").click();

    menu.navigateTo("Changes");

    const customTypesWithDocuments = [
      {
        id: customType.id,
        numberOfDocuments: 2000,
        url: "url",
      },
    ];

    mockPushLimit("HARD", customTypesWithDocuments);

    cy.pushLocalChanges();

    cy.contains("Manual action required").should("be.visible");
    cy.get("[data-cy='AssociatedDocumentsCard']").contains(
      customTypesWithDocuments[0].numberOfDocuments
    );
    cy.get("[data-cy='AssociatedDocumentsCard']").contains(customType.name);

    mockPushLimit("SOFT", customTypesWithDocuments);

    cy.contains("button", "Try again").click();
    cy.contains("Confirm deletion").should("be.visible");
    cy.get("[data-cy='AssociatedDocumentsCard']").contains(
      customTypesWithDocuments[0].numberOfDocuments
    );
    cy.get("[data-cy='AssociatedDocumentsCard']").contains(customType.name);

    cy.contains("button", "Push changes").should("be.disabled");

    cy.contains("label", "Delete these Documents").click();

    unmockPushLimit();

    cy.contains("button", "Push changes").should("be.enabled").click();

    cy.contains("Up to date").should("be.visible");
    cy.get("[data-cy=push-changes]").should("be.disabled");
  });

  it("shows a toaster on error", () => {
    mockPushError(500);
    cy.createCustomType(customType.id, customType.name);

    cy.visit("/changes");

    cy.get("[data-cy=push-changes]").click();
    cy.contains(
      "Something went wrong when pushing your changes. Check your terminal logs."
    );

    cy.clearProject();
  });

  it("show's the login modal on auth error", () => {
    mockPushError(403);
    cy.createCustomType(customType.id, customType.name);

    cy.visit("/changes");

    cy.get("[data-cy=push-changes]").click();

    cy.get("[aria-modal]").contains("You're not connected");
    cy.get("[aria-modal]").get("[aria-label='Close']").click();

    cy.get("[data-cy=changes-number]").within(() => {
      cy.contains(1).should("be.visible");
    });

    cy.clearProject();
  });
});
