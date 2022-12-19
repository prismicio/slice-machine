/// <reference types="Cypress" />
/// <reference types="cypress-localstorage-commands" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to type a random PascalCased string into input elements
     * @example cy.get('input').typeRandomPascalCase()
     */
    cleanSliceMachineUserContext(
      hasSendAReview?: boolean,
      isOnboarded?: boolean
    ): Chainable<undefined>;
    setupSliceMachineUserContext(
      hasSendAReview?: boolean,
      isOnboarded?: boolean,
      viewedUpdates?: Record<string, unknown>,
      hasSeenTutorialsTooTip?: boolean,
      hasSeenSimulatorToolTip?: boolean
    ): Chainable<undefined>;
    getSliceMachineUSerContext(): Chainable<
      undefined | Record<string, unknown>
    >;
    getInputByLabel<E extends Node = HTMLElement>(label: string): Chainable<JQuery<E>>
  }
}
