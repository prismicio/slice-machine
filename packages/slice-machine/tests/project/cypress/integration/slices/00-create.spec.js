import {randomPascalCase} from '../../support/utils'

describe("Create Slices", () => {
  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
  });

  it('A user can create a slice', () => {
    cy.setupSliceMachineUserContext()
    cy.visit('/slices')
    cy.waitUntil(() => cy.get('[data-cy=create-slice]'))
    cy.get('[data-cy=create-slice]').click()
    cy
      .get('[data-cy=create-slice-modal]')
      .should('be.visible');

    const name = randomPascalCase()
    cy.get('input[data-cy=slice-name-input]').type(name)
    cy.get('[data-cy=create-slice-modal]').submit()
    cy.location('pathname', {timeout: 5000}).should('eq', `/slices/${name}/default-slice`)
    cy.visit(`/slices/${name}/default-slice`)
    cy.location('pathname', {timeout: 5000}).should('eq', `/slices/${name}/default-slice`)
  })
})
