import { SliceBuilder } from "../../pages/slices/sliceBuilder";
import { Menu } from "../../pages/menu";
import { CustomTypeBuilder } from "../../pages/customTypes/customTypeBuilder";
import { SlicesList } from "../../pages/slices/slicesList";
import { ChangesPage } from "../../pages/changesPage";

describe("I am an existing SM user and I want to push local changes", () => {
  const random = Date.now();
  const menu = new Menu();
  const slicePage = new SliceBuilder();
  const slicesList = new SlicesList();
  const customTypeBuilder = new CustomTypeBuilder();
  const changesPage = new ChangesPage();

  const slice = {
    id: `test_push${random}`,
    name: `TestPush${random}`,
    library: "slices",
  };

  const customType = {
    id: `push_ct_${random}`,
    name: `Push CT ${random}`,
  };

  beforeEach("Start from the Slice page", () => {
    cy.clearProject();
    cy.setSliceMachineUserContext({});
  });

  it("Creates, updates and deletes slices and custom types", () => {
    cy.createSlice(slice.library, slice.id, slice.name);
    cy.createCustomType(customType.id, customType.name);

    menu.navigateTo("Changes");

    changesPage.pushChanges().isUpToDate();

    customTypeBuilder.goTo(customType.id).addTab("Foo").save();

    slicePage.goTo(slice.library, slice.name).addVariation("foo").save();

    menu.navigateTo("Changes");

    changesPage.pushChanges(2);

    cy.deleteCustomType(customType.id);

    menu.navigateTo("Slices");

    slicesList.deleteSlice(slice.name);

    menu.navigateTo("Changes");

    const customTypesWithDocuments = [
      {
        id: customType.id,
        numberOfDocuments: 2000,
        url: "url",
      },
    ];

    changesPage.mockPushLimit("HARD", customTypesWithDocuments);

    changesPage.pushChanges();

    cy.contains("Manual action required").should("be.visible");
    cy.get("[data-cy='AssociatedDocumentsCard']").contains(
      customTypesWithDocuments[0].numberOfDocuments
    );
    cy.get("[data-cy='AssociatedDocumentsCard']").contains(customType.name);

    changesPage.mockPushLimit("SOFT", customTypesWithDocuments);

    cy.contains("button", "Try again").click();
    cy.contains("Confirm deletion").should("be.visible");
    cy.get("[data-cy='AssociatedDocumentsCard']").contains(
      customTypesWithDocuments[0].numberOfDocuments
    );
    cy.get("[data-cy='AssociatedDocumentsCard']").contains(customType.name);
    cy.contains("button", "Push changes").should("be.disabled");

    cy.contains("label", "Delete these Documents").click();

    changesPage.unMockPushRequest();

    cy.contains("button", "Push changes").should("be.enabled").click();

    changesPage.isUpToDate();
  });

  it("shows a toaster on error", () => {
    cy.createCustomType(customType.id, customType.name);

    cy.visit("/changes");

    changesPage.mockPushError(500).pushChanges();

    cy.contains(
      "Something went wrong when pushing your changes. Check your terminal logs."
    );

    cy.clearProject();
  });

  it("show's the login modal on auth error", () => {
    cy.createCustomType(customType.id, customType.name);

    cy.visit("/changes");

    changesPage.mockPushError(403).pushChanges();

    cy.get("[aria-modal]").contains("You're not connected");
    cy.get("[aria-modal]").get("[aria-label='Close']").click();

    cy.clearProject();
  });

  it("show removed slice references", () => {
    cy.createSlice(slice.library, slice.id, slice.name);
    cy.createCustomType(customType.id, customType.name);

    customTypeBuilder.goTo(customType.id).addSliceToSliceZone(slice.id).save();

    cy.clearSlices();

    menu.navigateTo("Changes");
    changesPage.pushChanges();

    cy.contains("Missing Slices").should("be.visible");
    cy.get("[data-cy='CustomTypesReferencesCard']").contains(customType.name);

    customTypeBuilder.goTo(customType.id).save();

    menu.navigateTo("Changes");

    changesPage.pushChanges().isUpToDate();
  });
});
