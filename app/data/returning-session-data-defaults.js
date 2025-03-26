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
  formTitle: 'Amendment form: redundancy claim for holiday pay',
  status: 'Draft',
  isQuestionsComplete: 'no',
  payments: 'no',

  // Form questions
  highestPageId: 6,
  pages: [
    {
      intro: 'This is the intro',
      'long-title': 'What is your name?',
      'short-title': 'Full name',
      'hint-text': 'Enter your full name',
      type: 'text',
      pageIndex: '0'
    },
    {
      'long-title': 'What is your claim reference number?',
      'short-title': 'Claim reference number',
      'hint-text': 'Begins with LN',
      type: 'text',
      pageIndex: '1'
    },
    {
      'long-title': 'What is your National Insurance number?',
      'short-title': 'National Insurance number',
      'hint-text': 'It’s on your National Insurance card, benefit letter, payslip or P60. For example, ‘QQ 12 34 56 C’.',
      type: 'text',
      pageIndex: '2'
    },
    {
      'long-title': 'What is the name of the company?',
      'short-title': 'Company name',
      type: 'text',
      pageIndex: '3'
    },
    {
      'long-title': 'When did your leave year start?',
      'short-title': 'Holiday start date',
      'hint-text': 'For example 27 3 2007',
      type: 'date',
      pageIndex: '4'
    },
    {
      'long-title': 'How many holiday days were you entitled to for the full leave year?',
      'short-title': 'Leave days entitled to',
      'hint-text': 'Include bank holidays',
      type: 'number',
      pageIndex: '5'
    },
    {
      'long-title': 'How many holiday days did you take between the date your leave year started and the date you were made redundant?',
      'short-title': 'Leave days taken',
      'hint-text': 'Include any bank holidays that happened during this time',
      type: 'number',
      pageIndex: '6'
    },
    {
      'long-title': 'How many days did you carry over from your last leave year? ',
      'short-title': 'Days carried over from previous year',
      'hint-text': 'If you did not carry over any days enter ‘0’',
      type: 'number',
      pageIndex: '7'
    }
  ],

  // Placeholder override
  action: 'gogogo'
}
