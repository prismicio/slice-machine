import { customTypeBuilder } from "../../pages/customTypes/customTypeBuilder";
import { menu } from "../../pages/menu";
import { changesPage } from "../../pages/changes/changesPage";

const random = Date.now();
const customTypeName = `My Custom Type ${random}`;
const customTypeId = `my_custom_type_${random}`;

describe("I am a new SM user (with Next) who wants to create a Custom Type with fields, and then save and push it to Prismic.", () => {
	// using beforeEach instead of before to have it executed in case of retry
	beforeEach(() => {
		cy.clearProject();
	});

	it("Adding fields to repeatable CT & saving", () => {
		cy.setSliceMachineUserContext({});
		cy.visit("/");

		cy.createCustomType(customTypeId, customTypeName);
		customTypeBuilder.goTo(customTypeId);

		cy.addFieldToCustomType("UID", "ID Field", "uid");
		cy.addFieldToCustomType("Key Text", "Key Text Field", "key_text_id");
		cy.addFieldToCustomType("Rich Text", "Rich Text Field", "rich_text_id");
		customTypeBuilder.save();

		// Links to CTs available locally
		menu.navigateTo("Changes");
		cy.contains(customTypeId).click();
		cy.url().should("include", `/cts/${customTypeId}`);

		menu.navigateTo("Changes");
		changesPage.pushChanges().isUpToDate();
	});
});
