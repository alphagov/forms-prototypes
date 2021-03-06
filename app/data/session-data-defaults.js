/*

Provide default values for user session data. These are automatically added
via the `autoStoreData` middleware. Values will only be added to the
session if a value doesn't already exist. This may be useful for testing
journeys where users are returning or logging in to an existing application.

============================================================================

Example usage:

"full-name": "Sarah Philips",

"options-chosen": [ "foo", "bar" ]

============================================================================

*/

module.exports = {

  // Insert values here

  highestPageId: 0,
  action: '',
  publish: 'GOV.UK',
  authentication: 'email',
  payments: 'no',
  pages: [],
  status: 'Draft',
  confirmationTitle: 'Form submitted',
  confirmationNext: "We've sent you an email to confirm we have received your form.",
  checkAnswersTitle: 'Check your answers',
  checkAnswersDeclaration: 'By submitting this form you are confirming that, to the best of your knowledge, the answers you are providing are correct.'
}
