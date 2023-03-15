class ScreenshotModal {
  get closeButton() {
    return cy.contains("Close");
  }

  get imagePreview() {
    return cy.get("img");
  }

  get imageSrc() {
    this.imagePreview.then(($img) => {
      return $img.attr("src");
    });
  }

  close() {
    this.closeButton.click();

    return this;
  }
}

export const screenshotModal = new ScreenshotModal();
