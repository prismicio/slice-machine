export class EditorPage {
  /**
   * Type into an input text field
   *
   * @param {string} inputLabel the label of the input to change
   * @param {string} text the new value to type in
   */
  type(inputLabel, text, comparisonOperator = "contain") {
    cy.getInputByLabel(inputLabel).clear().type(text).blur();
    cy.getInputByLabel(inputLabel).should(comparisonOperator, text);
    return this;
  }

  /**
   * Toggle a Boolean widget
   *
   * @param {string} inputLabel the label of the input to click
   */
  toggleBooleanField(inputLabel) {
    cy.getInputByLabel(inputLabel).click();
    return this;
  }

  /**
   * Change the selected option in a Select widget
   *
   * @param {string} inputLabel the label of the input to click
   */
  select(inputLabel, value) {
    cy.getInputByLabel(inputLabel)
      .invoke("text")
      .then((currentValue) => {
        if (currentValue === value) {
          throw new Error(
            `Cannot toggle "${inputLabel}" to same value (${value})`
          );
        }
      });
    cy.getInputByLabel(inputLabel).click();
    cy.contains('[role="option"]', value).click();
    return this;
  }

  /**
   * Change the selected option in a Select widget
   *
   * @param {string} inputLabel the label of the input to click
   * @return {string} the src attribute of the selected image
   */
  changeImage(inputLabel) {
    cy.contains("header", inputLabel).contains("button", "Replace").click();

    return cy
      .get('[role="dialog"] img')
      .first()
      .click()
      .then(([img]) => img.src);
  }
}
