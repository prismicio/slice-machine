export class Menu {
  /**
   * @param {('Custom Types'|'Slices'|'Changes')} label - The menu item to click
   */
  navigateTo(label) {
    return cy.get("aside").contains(label).click();
  }
}
