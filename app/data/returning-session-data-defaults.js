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
  "highestPageId": 2,
  "action": "update",
  "publish": "GOV.UK",
  "authentication": "email",
  "payments": "no",
  "pages": [
    {
      "long-title": "What is your name?",
      "short-title": "name",
      "hint-text": "Give your name hint",
      "type": "text",
      "pageIndex": "0"
    },
    {
      "long-title": "An address question",
      "short-title": "address",
      "hint-text": "Just put the address in hint",
      "type": "address",
      "pageIndex": "1"
    }
  ],
  "status": "Draft",
  "confirmationTitle": "Form submitted",
  "confirmationNext": "We've sent you an email to confirm we have received your form.",
  "checkAnswersTitle": "Check your answers",
  "checkAnswersDeclaration": "By submitting this form you are confirming that, to the best of your knowledge, the answers you are providing are correct.",
  "formTitle": "Redundancy payments form: amend my personal details"
}
