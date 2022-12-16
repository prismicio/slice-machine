describe("onboarding", () => {
  it("I am an existing SM user and I want to be guided through the product.", () => {
    cy.visit("/");

    cy.contains("Welcome to Slice Machine").should("be.visible");
    cy.contains("Get Started").click();

    for (let page = 0; page < 3; ++page) {
      cy.get("video:visible").should("be.playing");
      cy.contains("Continue").click();
    }

    cy.contains("What are Custom Types?").should("be.visible");
    cy.contains('[role="tooltip"]', "Need Help?").within(() => {
      cy.root().should("be.visible");
      cy.get('button[aria-label="Close"]').click();
      cy.root().should("not.exist");
    });
    cy.reload();

    cy.contains("What are Custom Types?").should("be.visible");
    cy.wait(5_000 + 1_000);
    cy.contains('[role="tooltip"]', "Need Help?").should("not.exist");
  });

  it("I am an existing SM user and I want to skip the product guides.", () => {
    cy.visit("/");

    cy.contains("Welcome to Slice Machine").should("be.visible");
    cy.contains("Get Started").click();

    cy.get("video:visible").should("be.playing");
    cy.contains("skip").click();

    cy.contains("What are Custom Types?").should("be.visible");
    cy.contains('[role="tooltip"]', "Need Help?").within(() => {
      cy.root().should("be.visible");
      cy.get('button[aria-label="Close"]').click();
      cy.root().should("not.exist");
    });
    cy.reload();

    cy.contains("What are Custom Types?").should("be.visible");
    cy.wait(5_000 + 1_000);
    cy.contains('[role="tooltip"]', "Need Help?").should("not.exist");
  });
});
