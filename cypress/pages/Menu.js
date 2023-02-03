export class Menu {
  /**
   * @param {('Custom Types'|'Slices'|'Changes')} label - The menu item to click
   */
  navigateTo(label) {
    cy.get("aside").contains(label).click();
    cy.get("main a").contains(label);
    return this;
  }
}
