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
  action: 'gogogo',
  publish: 'GOV.UK',
  authentication: 'email',
  payments: 'no',
  pages: [
    {
      pageIndex: '0',
      type: 'text',
      'long-title': 'What type of animal is your pet?',
      'hint-text': 'For example a bird, cat, dog.',
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    },
    {
      pageIndex: '1',
      type: 'text',
      'long-title': 'What is the name of your pet?',
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    },
    {
      pageIndex: '2',
      type: 'text',
      'long-title': 'Where are you travelling to?',
      'hint-text': 'For example Lisbon, Portugal',
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    },
    {
      pageIndex: '3',
      type: 'date',
      'long-title': 'What date do you travel?',
      'hint-text': 'For example 27 3 2007',
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    },
    {
      pageIndex: '4',
      type: 'text',
      'long-title': 'How are you travelling?',
      'hint-text': 'For example plane, train, car.',
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    },
    {
      pageIndex: '5',
      type: 'select',
      'long-title': "Which of these countries have you lived in?",
      'item-list': [
        "England",
        "Wales"
      ],
      'listSettings': [
        "oneOption"
      ],
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    },
    {
      pageIndex: '6',
      type: 'number',
      'long-title': 'How many pets do you have?',
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    }
  ],
  status: 'Draft',
  confirmationTitle: 'Your form has been submitted',
  checkAnswersTitle: 'Check your answers before submitting your form',
  formTitle: 'Take your pet abroad',
  isQuestionsComplete: 'no'
}
