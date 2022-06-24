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
  highestPageId: 6,
  action: 'update',
  publish: 'GOV.UK',
  authentication: 'email',
  payments: 'no',
  pages: [
    {
      'long-title': 'What type animal is pet?',
      'short-title': 'Animal type',
      'hint-text': 'For example a bird, a hat.',
      type: 'text',
      pageIndex: '0'
    },
    {
      'long-title': 'What is the name of your pet?',
      'short-title': 'Pet name',
      type: 'text',
      pageIndex: '1'
    },
    {
      'long-title': 'Where are you travelling to?',
      'short-title': 'Destination',
      'hint-text': 'For example Lisbon, Portugal',
      type: 'text',
      pageIndex: '2'
    },
    {
      'long-title': 'What date do you travel?',
      'short-title': 'Date',
      'hint-text': 'For example 27 3 2007',
      type: 'address',
      pageIndex: '3'
    },
    {
      'long-title': 'What transport means are you using?',
      'short-title': 'Transport type',
      'hint-text': 'For example plane, train, car.',
      type: 'date',
      pageIndex: '4'
    },
    {
      'long-title': 'How many pets do you have',
      'short-title': 'How many pets',
      type: 'text',
      pageIndex: '5'
    }
  ],
  status: 'Draft',
  confirmationTitle: 'Form submitted',
  confirmationNext:
    "We've sent you an email to confirm we have received your form.",
  checkAnswersTitle: 'Check your answers',
  checkAnswersDeclaration:
    'By submitting this form you are confirming that, to the best of your knowledge, the answers you are providing are correct.',
  formTitle: 'Take your pet abroad'
}
