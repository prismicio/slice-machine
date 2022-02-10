import "cypress-localstorage-commands"
import 'cypress-wait-until';

Cypress.Commands.add('setupSliceMachineUserContext', (hasSendAReview = true, isOnboarded = true, viewedUpdates = {}) => {
  return cy.setLocalStorage("persist:root", JSON.stringify({
    userContext: JSON.stringify({
      hasSendAReview,
      isOnboarded,
      viewedUpdates: {patch: null, minor: null, major: null, ...viewedUpdates}
    })
  }))
})

Cypress.Commands.add('cleanSliceMachineUserContext', (hasSendAReview = true, isOnboarded = true) => {
  return cy.removeLocalStorage("persist:root")
})

Cypress.Commands.add('typeRandomPascalCase', { prevSubject: 'element' }, (
  subject /* :JQuery<HTMLElement> */,
  options,
) => {
  return cy.wrap(subject).type(cy.randomPascalCase(), options)
})

Cypress.Commands.add('typeRandomKebabCase', { prevSubject: 'element' }, (
  subject /* :JQuery<HTMLElement> */,
  options,
) => {
  return cy.wrap(subject).type(cy.randomKebabCase(), options)
})