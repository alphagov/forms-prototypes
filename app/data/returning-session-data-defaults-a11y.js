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
      'long-title': 'What type of animal is your pet?',
      'short-title': 'Animal type',
      'hint-text': 'For example a bird, cat, dog.',
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
      type: 'date',
      pageIndex: '3'
    },
    {
      'long-title': 'How are you travelling?',
      'short-title': 'Transport type',
      'hint-text': 'For example plane, train, car.',
      type: 'text',
      pageIndex: '4'
    },
    {
      'long-title': 'How many pets do you have?',
      'short-title': 'Number of pets',
      type: 'number',
      pageIndex: '5'
    }
  ],
  status: 'Draft',
  confirmationTitle: 'Your form has been submitted',
  checkAnswersTitle: 'Check your answers before submitting your form',
  formTitle: 'Take your pet abroad'
}
