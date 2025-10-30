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
  formTitle: 'Take your pet abroad',
  status: 'Draft',
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
  isQuestionsComplete: 'no',

  checkAnswersDeclaration: '',
  
  confirmationNext: 'We will update your claim with the new information you provided. We aim to do this within 10 working days. After we have updated your information, we will let you know if you are due a payment. You do not need to send us any further evidence to complete your application.\n\nIf you have not had a response from us within 15 working days, contact us at: [redundancypaymentsonline@insolvency.gov.uk](mailto:redundancypaymentsonline@insolvency.gov.uk)\n\nMake sure you have told the insolvency practitioner handling your employer’s insolvency about the changes you have made to your claim information. They may need to change the information they provided the Insolvency Service.\n\nTo make another amendment to your redundancy claim, complete the relevant form from the [redundancy claim amendment forms](https://www.gov.uk/guidance/amend-a-redundancy-claim) page.',

  payments: 'no',

  supportDetails: [
    'phone'
  ],

  phoneSupport: 'Phone: 020 7946 0101\n\nMonday to Friday, 9am to 5pm (except public holidays)',

  confirmationTitle: 'Your form has been submitted',
  checkAnswersTitle: 'Check your answers before submitting your form'
}
