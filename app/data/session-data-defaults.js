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
  formTitle: "Untitled form",
  action: "",
  publish: "GOV.UK",
  authentication: "email",
  payments: "no",
  pages: [],
  status: "Draft",
  confirmationTitle: "Application complete",
  confirmationNext: "We've sent you an email confirming that we have received your application.",
  checkAnswersTitle: "Check your answers before sending your application",
  checkAnswersDeclaration: "By submitting this application you are confirming that, to the best of your knowledge, the details you are providing are correct."
}
