import { SlicePage } from "../../pages/slices/slicePage";
import {
  KeyTextModal,
  RichTextModal,
} from "../../pages/slices/editWidgetModals";

const SLICE = {
  id: "sliceBuild",
  name: "SliceBuilding",
  library: "slices",
};

describe("I am a new SM user (with Next) who wants to build a slice with different widgets.", () => {
  let slicePage = new SlicePage();
  let keyTextModal = new KeyTextModal();
  let richTextModal = new RichTextModal();
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
    slicePage.addNewWidgetField("RichTextField", "Rich Text");

    slicePage.openEditWidgetModal("SimpleTextField");
    keyTextModal
      .editLabel("NewTextName")
      .editApiId("KeyTextApiID")
      .editPlaceholder("Default")
      .save();
    slicePage.getWidgetField("NewTextName");

    slicePage.openEditWidgetModal("RichTextField");
    richTextModal
      .editLabel("NewRichTextField")
      .editApiId("RichTextApiID")
      .editPlaceholder("Default")
      .toggleAllowTargetBlank()
      .toggleAllowMultipleParagraphs()
      .deselectAllTextTypes()
      .toggleTextTypes(["H1", "H3", "image"])
      .save();
    slicePage.getWidgetField("NewRichTextField");

    slicePage.save();
  });
});
