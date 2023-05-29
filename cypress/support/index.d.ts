/// <reference types="Cypress" />
/// <reference types="cypress-localstorage-commands" />

declare namespace Cypress {
  interface Chainable {
    setSliceMachineUserContext(
      hasSendAReview?: boolean,
      viewedUpdates?: Record<string, unknown>,
      hasSeenTutorialsTooTip?: boolean,
      hasSeenSimulatorToolTip?: boolean
    ): Chainable<undefined>;
    getSliceMachineUSerContext(): Chainable<
      undefined | Record<string, unknown>
    >;
    getInputByLabel<E extends Node = HTMLElement>(
      label: string
    ): Chainable<JQuery<E>>;
  }
}
