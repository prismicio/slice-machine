export class Menu {
  navigateTo(label) {
    return cy.get("aside").contains(label).click();
  }
}
