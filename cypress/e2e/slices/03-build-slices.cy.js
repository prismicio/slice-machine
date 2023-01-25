import { SlicePage } from "../../pages/slices/slicePage";
import {
  BooleanModal,
  ColorModal,
  EmbedModal,
  ImageModal,
  KeyTextModal,
  LinkModal,
  LinkToMediaModal,
  NumberModal,
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
  let linkModal = new LinkModal();
  let linkToMediaModal = new LinkToMediaModal();
  let imageModal = new ImageModal();
  let booleanModal = new BooleanModal();
  let numberModal = new NumberModal();
  let embedModal = new EmbedModal();
  let colorModal = new ColorModal();

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
    slicePage.addNewWidgetField("LinkField", "Link");
    slicePage.addNewWidgetField("LinkToMediaField", "Link to media");
    slicePage.addNewWidgetField("ImageField", "Image");
    slicePage.addNewWidgetField("BooleanField", "Boolean");
    slicePage.addNewWidgetField("NumberField", "Number");
    slicePage.addNewWidgetField("EmbedField", "Embed");
    slicePage.addNewWidgetField("ColorField", "Color");

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

    slicePage.openEditWidgetModal("LinkField");
    linkModal
      .editLabel("NewLinkField")
      .editApiId("LinkApiID")
      .editPlaceholder("Default")
      .toggleAllowTargetBlank()
      .save();
    slicePage.getWidgetField("NewLinkField");

    slicePage.openEditWidgetModal("LinkToMediaField");
    linkToMediaModal
      .editLabel("NewLinkToMediaField")
      .editApiId("LinkToMediaApiID")
      .editPlaceholder("Default")
      .save();
    slicePage.getWidgetField("NewLinkToMediaField");

    slicePage.openEditWidgetModal("ImageField");
    imageModal
      .editLabel("NewImageField")
      .editApiId("ImageApiID")
      .editWidth("200")
      .editHeight("200")
      .addThumbnail("Thumbnail2", 100, 80)
      .save();
    slicePage.getWidgetField("NewImageField");

    slicePage.openEditWidgetModal("BooleanField");
    booleanModal
      .editLabel("NewBooleanField")
      .editApiId("BooleanApiID")
      .editFalsePlaceholder("NewFalse")
      .editTruePlaceholder("NewTrue")
      .toggleDefaultTrue()
      .save();
    slicePage.getWidgetField("NewBooleanField");

    slicePage.openEditWidgetModal("NumberField");
    numberModal
      .editLabel("NewNumberField")
      .editApiId("NumberApiID")
      .editPlaceholder("Default")
      .save();
    slicePage.getWidgetField("NewNumberField");

    slicePage.openEditWidgetModal("EmbedField");
    embedModal
      .editLabel("NewEmbedField")
      .editApiId("EmbedApiID")
      .editPlaceholder("Default")
      .save();
    slicePage.getWidgetField("NewEmbedField");

    slicePage.openEditWidgetModal("ColorField");
    colorModal
      .editLabel("NewColorField")
      .editApiId("ColorApiID")
      .editPlaceholder("Default")
      .save();
    slicePage.getWidgetField("NewColorField");

    slicePage.save();
  });
});
