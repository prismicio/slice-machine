/**
 * Compare an img element to a fixture image. This only compares image dimensions
 * so make sure your data set does not contain images with the same size.
 * @param {*} subject, the img element
 * @param {*} fixtureImage, the reference image fixture path
 */
export function isSameImageAs(subject, fixtureImage) {
	cy.fixture(fixtureImage).then((base64) => {
		const fixtureImage = new Image();
		fixtureImage.src = `data:image/png;base64,${base64}`;

		return new Promise((resolve) => {
			fixtureImage.onload = () => {
				isCorrectDimensions(
					subject,
					fixtureImage.naturalWidth,
					fixtureImage.naturalHeight
				);
				resolve();
			};
		});
	});
}

export function isCorrectDimensions(subject, expectedWidth, expectedHeight) {
	cy.wrap(subject)
		.should("be.visible")
		.and(($img) => {
			expect($img[0].naturalWidth).to.equal(expectedWidth);
			expect($img[0].naturalHeight).to.equal(expectedHeight);
		});
}
