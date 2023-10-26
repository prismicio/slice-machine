import { BaseBuilder } from "../BaseBuilder";

class SliceBuilder extends BaseBuilder {
  get imagePreview() {
    return cy.get("[alt='Preview image']");
  }

  get imagePreviewSrc() {
    this.imagePreview.then(($img) => {
      return $img.attr("src");
    });
  }

  get renameButton() {
    return cy.get('[data-cy="edit-slice-name"]');
  }

  get headerSliceNameAndVariation() {
    return cy.get('[data-cy="slice-and-variation-name-header"]');
  }

  get staticZone() {
    return cy.get("[data-cy=slice-non-repeatable-zone]");
  }

  get addStaticFieldButton() {
    return cy.get("[data-cy=add-Static-field]");
  }

  get repeatableZone() {
    return cy.get("[data-cy=slice-repeatable-zone]");
  }

  get addRepeatableFieldButton() {
    return cy.get("[data-cy=add-Repeatable-field]");
  }

  get addVariationButton() {
    return cy.contains("button", "Add a new variation");
  }

  goTo(sliceLibrary, sliceName, variation = "default") {
    cy.visit(`/slices/${sliceLibrary}/${sliceName}/${variation}`);
    this.saveButton.should("be.visible");
    cy.contains(sliceName).should("be.visible");
    return this;
  }

  changeToVariation(startVariation, targetVariation) {
    cy.get("button").contains(startVariation).click();
    cy.contains(targetVariation).click();
    return this;
  }

  save() {
    this.saveButton.click();
    this.saveButton.should("be.disabled");
    return this;
  }

  // TODO: find a way to avoid having to redirect to the simulator url using cy.visit()
  openSimulator() {
    let simUrl;
    // intercept the browser trying to open a new tab since Cypress does not support multi-tabs testing.
    cy.window().then((win) => {
      cy.stub(win, "open")
        .as("windowOpen")
        .callsFake((url) => {
          simUrl = url;
          console.log(
            `window.open() won't be called as it currently generates a timeout in cypress. Calling cy.visit('${url}') instead.`,
          );
          // win.open.wrappedMethod.call(win, url, "_self");
        });
    });
    cy.contains("Simulate")
      .click()
      .then(() => {
        cy.get("@windowOpen").should("be.called");
        cy.visit(simUrl);
      });
    return this;
  }

  /**
   * add a new variation through the variation modal.
   *
   * @param {string} variationName Name of the variation.
   */
  addVariation(variationName) {
    cy.contains("button", "Add a new variation").click();

    cy.get("[aria-modal]").within(() => {
      cy.getInputByLabel("Variation name*").type(variationName);
      cy.contains("button", "Submit").click();
    });
    cy.get("[aria-modal]").should("not.exist");

    return this;
  }

  /**
   * add a new widget through the modal form.
   *
   * @param {string} name Name of the widget field.
   * @param {string} type Type of the widget.
   */
  addNewWidgetField(name, type) {
    cy.get("[data-cy='add-Static-field']").click();
    cy.get("[aria-label='Widget Form Modal']").should("be.visible");

    cy.contains("div", type).click();

    const nameInput = '[data-cy="new-field-name-input"]';

    cy.get(nameInput).clear();
    cy.get(nameInput).type(name).blur();

    cy.contains(/^Add$/).click();

    return this;
  }

  /**
   * Get the relevant edit widget modal.
   *
   * @param {string} name Name of the widget field.
   */
  getWidgetField(name) {
    return cy.contains("div", name).parent();
  }

  /**
   * Open the relevant edit widget modal.
   *
   * @param {string} name Name of the widget field.
   */
  openEditWidgetModal(name) {
    cy.contains("div", name)
      .parent()
      .find("[aria-label='Edit slice field']")
      .click();

    return this;
  }

  /**
   * delete the relevant edit widget modal.
   *
   * @param {string} name Name of the widget field.
   */
  deleteWidgetField(name) {
    cy.contains("div", name)
      .parent()
      .find("[data-cy='slice-menu-button']")
      .click();

    cy.contains("div", "Delete field").click({ force: true });

    cy.contains("div", name).should("not.exist");

    return this;
  }
}

export const sliceBuilder = new SliceBuilder();
