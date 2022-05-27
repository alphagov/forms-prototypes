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
  "action": "update",
  "publish": "GOV.UK",
  "authentication": "email",
  "payments": "no",
  "pages": [
    {
      "long-title": "What is you name?",
      "short-title": "Name",
      "hint-text": "Enter your fuul name",
      "type": "text",
      "pageIndex": "0"
    },
    {
      "long-title": "What is your claim reference number?",
      "short-title": "Claim reference number",
      "hint-text": "Begings with LN",
      "type": "text",
      "pageIndex": "1"
    },
    {
      "long-title": "What is your national insurance number?",
      "short-title": "National Insurance number",
      "hint-text": "For example QQ12345C",
      "type": "text",
      "pageIndex": "2"
    },
    {
      "long-title": "What is your date of bitrh?",
      "short-title": "Date of Bitrh",
      "hint-text": "For example 27 3 2007",
      "type": "address",
      "pageIndex": "3"
    },
    {
      "long-title": "When did you submit your redundancy claim?",
      "short-title": "Claim submitted",
      "hint-text": "For example 27 3 2007",
      "type": "date",
      "pageIndex": "4"
    },
    {
      "long-title": "What is your adress?",
      "short-title": "Address",
      "type": "date",
      "pageIndex": "5"
    }
  ],
  "status": "Draft",
  "confirmationTitle": "Form submitted",
  "confirmationNext": "We've sent you an email to confirm we have received your form.",
  "checkAnswersTitle": "Check your answers",
  "checkAnswersDeclaration": "By submitting this form you are confirming that, to the best of your knowledge, the answers you are providing are correct.",
  "formTitle": "Redundancy payments form: amend my personal details"
}
