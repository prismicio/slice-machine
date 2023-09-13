import { sliceBuilder } from "../../pages/slices/sliceBuilder";
import { menu } from "../../pages/menu";
import { customTypeBuilder } from "../../pages/customTypes/customTypeBuilder";
import { slicesList } from "../../pages/slices/slicesList";
import { changesPage } from "../../pages/changes/changesPage";
import {
  hardDeleteDocumentsDrawer,
  referencesErrorDrawer,
  softDeleteDocumentsDrawer,
} from "../../pages/changes/drawers";

// TODO: enable when transactional push requests responses can be mocked
describe.skip("I am an existing SM user and I want to push local changes", () => {
  const random = Date.now();

  const slice = {
    id: `test_push${random}`,
    name: `TestPush${random}`,
    library: ".--slices",
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

    sliceBuilder.goTo(slice.library, slice.name).addVariation("foo").save();

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

    hardDeleteDocumentsDrawer.title.should("be.visible");
    hardDeleteDocumentsDrawer
      .getAssociatedDocuments(customType.name)
      .contains(customTypesWithDocuments[0].numberOfDocuments);

    changesPage.mockPushLimit("SOFT", customTypesWithDocuments);

    hardDeleteDocumentsDrawer.pushButton.click();

    softDeleteDocumentsDrawer.title.should("be.visible");
    softDeleteDocumentsDrawer
      .getAssociatedDocuments(customType.name)
      .contains(customTypesWithDocuments[0].numberOfDocuments);

    softDeleteDocumentsDrawer.pushButton.should("be.disabled");

    changesPage.unMockPushRequest();

    softDeleteDocumentsDrawer.confirmDelete();

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

  it("show removed slice references", async () => {
    cy.createSlice(slice.library, slice.id, slice.name);
    cy.createCustomType(customType.id, customType.name);

    customTypeBuilder.goTo(customType.id);

    await customTypeBuilder.addSliceToSliceZone(slice.id).save();

    cy.clearSlices();

    menu.navigateTo("Changes");
    changesPage.pushChanges();

    referencesErrorDrawer.title.should("be.visible");
    referencesErrorDrawer.getCustomTypeReferencesCard(customType.name);

    customTypeBuilder.goTo(customType.id).save();

    menu.navigateTo("Changes");

    changesPage.pushChanges().isUpToDate();
  });
});
