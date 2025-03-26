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
  /* Dummy form settings */
  formTitle: 'Tell us about a complaint or concern',
  status: 'Draft',
  isQuestionsComplete: 'no',
  payments: 'no',

  // Form questions
  highestPageId: 6,
  pages: [
    {
      pageIndex: '0',
      type: 'select',
      'long-title': 'Are you making a complaint or reporting an error?',
      'item-list': [
        "Making a complaint",
        "Reporting an error"
      ],
      'listSettings': [
        "oneOption"
      ],
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    },
    {
      pageIndex: '1',
      type: 'select',
      'long-title': 'What does your complaint relate to?',
      'item-list': [
        "Service",
        "Access",
        "Availability",
        "Something else"
      ],
      'listSettings': [
        "oneOption"
      ],
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    },
    {
      pageIndex: '2',
      type: 'text',
      input: "multi-line-input",
      'long-title': 'Please give full details of your complaint',
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    },
    {
      pageIndex: '3',
      type: 'text',
      input: "single-line-input",
      'long-title': 'What were you trying to do when the error happend?',
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    },
    {
      pageIndex: '4',
      type: 'text',
      input: "multi-line-input",
      'long-title': 'Please tell us what happened when the error occurred',
      'additional-guidance': 'No',
      'questionSaved': 'Yes',
    },
    {
      pageIndex: '5',
      type: 'select',
      'long-title': 'How would you rate your overall experience of using the service?',
      'item-list': [
        "Very poor",
        "Poor",
        "Neutral",
        "Good",
        "Very good"
      ],
      'listSettings': [
        "oneOption"
      ],
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    }
  ],

  // Placeholder override
  action: 'gogogo'
}
