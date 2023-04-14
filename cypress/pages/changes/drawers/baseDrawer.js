export class BaseDrawer {
	constructor(title) {
		this.rootSelector = "[class='drawer-content']";
		this.drawerTitle = title;
	}

	get root() {
		return cy.get(this.rootSelector);
	}

	get title() {
		return this.root.contains(this.drawerTitle);
	}

	get pushButton() {
		return this.root.contains("button", "Try again");
	}

	pushChanges() {
		this.pushButton.click();

		return this;
	}
}
