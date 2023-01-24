import { SlicePage } from "../../pages/slices/slicePage";
import { EditKeyTextModal } from "../../pages/slices/editWidgetModals";

const SLICE = {
  id: "sliceBuild",
  name: "SliceBuilding",
  library: "slices",
};

describe("I am a new SM user (with Next) who wants to build a slice with different widgets.", () => {
  let slicePage = new SlicePage();
  let editKeyTextModal = new EditKeyTextModal();
  before(() => {
    cy.clearProject();
  });

  beforeEach(() => {
    cy.setSliceMachineUserContext({});
  });

  it("Creates a slice and edits the fields in it", () => {
    cy.createSlice(SLICE.library, SLICE.id, SLICE.name);

    slicePage.deleteWidgetField("Title");
    slicePage.deleteWidgetField("Description");

    slicePage.addNewWidgetField("SimpleTextField", "Key Text");

    slicePage.openEditWidgetModal("SimpleTextField");
    editKeyTextModal
      .editLabel("NewTextName")
      .editApiId("SomeNewID")
      .editPlaceholder("Default")
      .save();
    slicePage.getWidgetField("NewTextName");

    slicePage.save();
  });
});
