class EditorPage {
  #root = ".editor";

  /**
   * Checks if the editor sidebar contains some text
   * Useful to check it isi fully loaded before interacting
   *
   * @param {string} text the text we are looking for
   */
  contains(text) {
    return cy.contains(this.#root, text);
  }

  /**
   * Type into an input text field
   *
   * @param {string} inputLabel the label of the input to change
   * @param {string} text the new value to type in
   * @param {string} comparisonOperator the comparison operator to use
   */
  type(inputLabel, text, comparisonOperator = "contain") {
    cy.get(this.#root).getInputByLabel(inputLabel).clear().type(text).blur();
    cy.get(this.#root)
      .getInputByLabel(inputLabel)
      .should(comparisonOperator, text);

    return this;
  }

  /**
   * Toggle a Boolean widget
   *
   * @param {string} inputLabel the label of the input to click
   */
  toggleBooleanField(inputLabel) {
    cy.get(this.#root).getInputByLabel(inputLabel).click();

    return this;
  }

  /**
   * Change the selected option in a Select widget
   *
   * @param {string} inputLabel the label of the input to click
   * @param {string} value the value of the option to select
   */
  select(inputLabel, value) {
    cy.get(this.#root)
      .getInputByLabel(inputLabel)
      .invoke("text")
      .then((currentValue) => {
        if (currentValue === value) {
          throw new Error(
            `Cannot toggle "${inputLabel}" to same value (${value})`
          );
        }
      });
    cy.get(this.#root).getInputByLabel(inputLabel).click();
    cy.contains('[role="option"]', value).click();

    return this;
  }

  /**
   * Change the selected option in a Select widget
   *
   * @param {string} inputLabel the label of the input to click
   */
  changeImage(inputLabel) {
    cy.get(this.#root)
      .contains("header", inputLabel)
      .contains("button", "Replace")
      .click();

    return cy.get('[role="dialog"] img').first().click();
  }
}

export const editorPage = new EditorPage();
