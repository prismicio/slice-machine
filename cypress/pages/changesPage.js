export class ChangesPage {
  get screenshotsButton() {
    return cy.get("button").contains("Update all screenshots");
  }
}
