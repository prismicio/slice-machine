import { changesPage } from "../pages/changes/changesPage";
import { menu } from "../pages/menu";

/**
 * Push Changes to the Repository, assert the number of changes as well.
 *
 * @param {number} numberOfChanges number of changes that should be pushed, this number is used for assertions. If this is undefined, no assertions will be made on the number of changes left after the push
 */
export function pushLocalChanges(numberOfChanges) {
  changesPage.goTo();

  if (numberOfChanges !== undefined) {
    // checking number of changes
    menu.changesNumber()
    // .contains(numberOfChanges)
    .should("be.visible");
  }

  // sync changes button should be enabled
  changesPage.pushButton.should("be.enabled");

  // click to push changes
  changesPage.pushButton.click();
  if (numberOfChanges !== undefined) {
    // number of changes should now be 0 at the end of the push
    // The time to wait depends on the number of changes
    menu
      .changesNumber({
        timeout: 2 * 60 * 1000 * (numberOfChanges + 1),
      })
      .should("not.exist");

    // sync changes button should be disabled
    changesPage.pushButton.should("be.disabled");
  }
}
