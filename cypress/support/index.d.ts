/// <reference types="Cypress" />
/// <reference types="cypress-localstorage-commands" />

declare namespace Cypress {
  interface Chainable {
    setSliceMachineUserContext(
      hasSendAReview?: boolean,
      isOnboarded?: boolean,
      viewedUpdates?: Record<string, unknown>,
      hasSeenTutorialsTooTip?: boolean
    ): Chainable<undefined>;
    getSliceMachineUSerContext(): Chainable<
      undefined | Record<string, unknown>
    >;
  }

  interface Chainer<Subject> {
    (chainer: "be.playing"): Chainable<Subject>;
    (chainer: "not.be.playing"): Chainable<Subject>;
  }
}
