// Compare an element src attribute to a fixture image, using a hash of the Base64 images
export function isSameImageAs(subject, referenceImage) {
  cy.wrap(subject)
    .should(([img]) => expect(img.complete).to.be.true)
    .then(([img]) => cy.request({ url: img.src, encoding: "base64" }))
    .then((response) => cy.task("sha256", response.body))
    .then((imageHash) => {
      cy.fixture(referenceImage).then((base64Ref) => {
        cy.task("sha256", base64Ref).then((refHash) => {
          expect(imageHash).to.equal(refHash, "Base64 image hash comparison");
        });
      });
    });
}
