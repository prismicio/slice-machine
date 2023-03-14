import { sliceBuilder } from "../../pages/slices/sliceBuilder";
import {
  booleanModal,
  colorModal,
  contentRelationshipModal,
  dateModal,
  embedModal,
  geoPointModal,
  imageModal,
  keyTextModal,
  linkModal,
  linkToMediaModal,
  numberModal,
  richTextModal,
  selectModal,
  timestampModal,
} from "../../pages/slices/editWidgetModals";

const SLICE = {
  id: "sliceBuild",
  name: "SliceBuilding",
  library: ".--slices",
};

describe("I am a new SM user (with Next) who wants to build a slice with different widgets.", () => {
  before(() => {
    cy.clearProject();
  });

  beforeEach(() => {
    cy.setSliceMachineUserContext({});
  });

  it("Creates a slice and edits the fields in it", () => {
    const customTypeName = "Single Custom Type";
    const customTypeId = "single_custom_type";
    cy.createCustomType(customTypeId, customTypeName);
    cy.createSlice(SLICE.library, SLICE.id, SLICE.name);

    sliceBuilder.deleteWidgetField("Title");
    sliceBuilder.deleteWidgetField("Description");

    sliceBuilder.addNewWidgetField("SimpleTextField", "Key Text");
    sliceBuilder.addNewWidgetField("RichTextField", "Rich Text");
    sliceBuilder.addNewWidgetField("LinkField", "Link");
    sliceBuilder.addNewWidgetField("LinkToMediaField", "Link to media");
    sliceBuilder.addNewWidgetField("ImageField", "Image");
    sliceBuilder.addNewWidgetField("BooleanField", "Boolean");
    sliceBuilder.addNewWidgetField("NumberField", "Number");
    sliceBuilder.addNewWidgetField("EmbedField", "Embed");
    sliceBuilder.addNewWidgetField("ColorField", "Color");
    sliceBuilder.addNewWidgetField("TimestampField", "Timestamp");
    sliceBuilder.addNewWidgetField("DateField", "Date");
    sliceBuilder.addNewWidgetField("GeoPointField", "GeoPoint");
    sliceBuilder.addNewWidgetField("SelectField", "Select");
    sliceBuilder.addNewWidgetField(
      "ContentRelationshipField",
      "Content Relationship"
    );

    sliceBuilder.openEditWidgetModal("SimpleTextField");
    keyTextModal
      .editLabel("NewTextName")
      .editApiId("KeyTextApiID")
      .editPlaceholder("Default")
      .save();
    sliceBuilder.getWidgetField("NewTextName");

    sliceBuilder.openEditWidgetModal("RichTextField");
    richTextModal
      .editLabel("NewRichTextField")
      .editApiId("RichTextApiID")
      .editPlaceholder("Default")
      .toggleAllowTargetBlank()
      .toggleAllowMultipleParagraphs()
      .deselectAllTextTypes()
      .toggleTextTypes(["H1", "H3", "image"])
      .save();
    sliceBuilder.getWidgetField("NewRichTextField");

    sliceBuilder.openEditWidgetModal("LinkField");
    linkModal
      .editLabel("NewLinkField")
      .editApiId("LinkApiID")
      .editPlaceholder("Default")
      .toggleAllowTargetBlank()
      .save();
    sliceBuilder.getWidgetField("NewLinkField");

    sliceBuilder.openEditWidgetModal("LinkToMediaField");
    linkToMediaModal
      .editLabel("NewLinkToMediaField")
      .editApiId("LinkToMediaApiID")
      .editPlaceholder("Default")
      .save();
    sliceBuilder.getWidgetField("NewLinkToMediaField");

    sliceBuilder.openEditWidgetModal("ImageField");
    imageModal
      .editLabel("NewImageField")
      .editApiId("ImageApiID")
      .editWidth("200")
      .editHeight("200")
      .addThumbnail("Thumbnail2", 100, 80)
      .save();
    sliceBuilder.getWidgetField("NewImageField");

    sliceBuilder.openEditWidgetModal("BooleanField");
    booleanModal
      .editLabel("NewBooleanField")
      .editApiId("BooleanApiID")
      .editFalsePlaceholder("NewFalse")
      .editTruePlaceholder("NewTrue")
      .toggleDefaultTrue()
      .save();
    sliceBuilder.getWidgetField("NewBooleanField");

    sliceBuilder.openEditWidgetModal("NumberField");
    numberModal
      .editLabel("NewNumberField")
      .editApiId("NumberApiID")
      .editPlaceholder("Default")
      .save();
    sliceBuilder.getWidgetField("NewNumberField");

    sliceBuilder.openEditWidgetModal("EmbedField");
    embedModal
      .editLabel("NewEmbedField")
      .editApiId("EmbedApiID")
      .editPlaceholder("Default")
      .save();
    sliceBuilder.getWidgetField("NewEmbedField");

    sliceBuilder.openEditWidgetModal("ColorField");
    colorModal
      .editLabel("NewColorField")
      .editApiId("ColorApiID")
      .editPlaceholder("Default")
      .save();
    sliceBuilder.getWidgetField("NewColorField");

    sliceBuilder.openEditWidgetModal("TimestampField");
    timestampModal
      .editLabel("NewTimestampField")
      .editApiId("TimestampApiID")
      .editPlaceholder("Default")
      .save();
    sliceBuilder.getWidgetField("NewTimestampField");

    sliceBuilder.openEditWidgetModal("DateField");
    dateModal
      .editLabel("NewDateField")
      .editApiId("DateApiID")
      .editPlaceholder("Default")
      .save();
    sliceBuilder.getWidgetField("NewDateField");

    sliceBuilder.openEditWidgetModal("GeoPointField");
    geoPointModal
      .editLabel("NewGeoPointField")
      .editApiId("GeoPointApiID")
      .save();
    sliceBuilder.getWidgetField("NewGeoPointField");

    sliceBuilder.openEditWidgetModal("SelectField");
    selectModal
      .editLabel("NewSelectField")
      .editApiId("SelectApiID")
      .editPlaceholder("Default")
      .toggleFirstValAsDefault()
      .changeOptionLabel(1, "Option 1")
      .changeOptionLabel(2, "Option 2")
      .addOption("Option 3")
      .save();
    sliceBuilder.getWidgetField("NewSelectField");

    sliceBuilder.openEditWidgetModal("ContentRelationshipField");
    contentRelationshipModal
      .editLabel("NewContentRelationshipField")
      .editApiId("ContentRelationshipApiID")
      .addCustomType(customTypeName)
      .save();
    sliceBuilder.getWidgetField("NewContentRelationshipField");

    sliceBuilder.save();
  });
});
