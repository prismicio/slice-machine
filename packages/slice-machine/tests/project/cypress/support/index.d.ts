/// <reference types="Cypress" />
/// <reference types="cypress-localstorage-commands" />


declare namespace Cypress {

  interface Chainable {
    /**
    * Custom command to type a random PascalCased string into input elements
    * @example cy.get('input').typeRandomPascalCase()
    */
    typeRandomPascalCase(options?: Partial<TypeOptions>): Chainable<Element>

    typeRandomKebabCase(options?: Partial<TypeOptions>): Chainable<Element>
  }
}