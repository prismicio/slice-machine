import {randomString, capitalizeFirstChar} from '../../support/utils'

describe("Custom Types specs", () => {
  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
  });

  it('A user can create a custom type', () => {
    cy.setupSliceMachineUserContext()
    cy.visit('/')
    // loading spinner
    cy.waitUntil(() => cy.get('[data-cy=create-ct]')).then(() => true)
    cy.get('[data-cy=create-ct]').click()
    cy
      .get('[data-cy=create-ct-modal]')
      .should('be.visible');

    const name = [randomString(), randomString()].map(capitalizeFirstChar).join(" ")
    const id = name.toLowerCase().replace(" ", '-')

    cy.get('input[data-cy=ct-name-input]').type(name)
    cy.get('input[data-cy=ct-id-input]').type(id)
    cy.get('[data-cy=create-ct-modal]').submit()
    cy.location('pathname', {timeout: 5000}).should("eq", `/cts/${id}`)
    cy.visit(`/cts/${id}`)
    cy.location('pathname', {timeout: 5000}).should("eq", `/cts/${id}`)
  })
})
