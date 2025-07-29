/*

This is the latest version of return data for a dummy form to be used in testing the branching journey: 
created 26 March 2025
testing: week commencing 31 March 2025

*/

module.exports = {
  /* Dummy form settings */
  formTitle: 'Tell us about a complaint, concern or error',
  status: 'Draft',

  // Form tasks
  isQuestionsComplete: 'no',
  // checkAnswersDeclaration
  isDeclarationComplete: 'no',
  // confirmationNext
  isConfirmationComplete: 'no',
  // formsEmail
  isSubmissionEmailComplete: 'no',
  // confirmationCode
  isConfirmationCodeComplete: 'no',
  // privacyInformation
  isPrivacyInformationComplete: 'no',
  // supportDetails - emailSupport, phoneSupport, onlineSupportLink, onlineSupportText
  isSupportDetailsComplete: 'no',
  // makeFormLive
  isFormLive: 'no',

  // Form questions
  highestPageId: 7,
  pages: [
    {
      pageIndex: '0',
      type: 'select',
      'long-title': 'Which of these do you want to do today?',
      'item-list': [
        "Report an error",
        "Make a complaint",
        "Raise a concern"
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
      'long-title': 'What does your complaint or concern relate to?',
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
      'long-title': 'Please give full details of your complaint or concern',
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    },
    {
      pageIndex: '3',
      type: 'select',
      'long-title': 'Have you contacted us about this before?',
      'item-list': [
        "Yes",
        "No"
      ],
      'listSettings': [
        "oneOption"
      ],
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    },
    {
      pageIndex: '4',
      type: 'text',
      input: "single-line-input",
      'long-title': 'What were you trying to do when the error happend?',
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    },
    {
      pageIndex: '5',
      type: 'text',
      input: "multi-line-input",
      'long-title': 'Please tell us what happened when the error occurred',
      'additional-guidance': 'No',
      'questionSaved': 'Yes'
    },
    {
      pageIndex: '6',
      type: 'text',
      input: "multi-line-input",
      'long-title': 'What did you do, if anything, to work around the error?',
      'additional-guidance': 'No',
      "questionOptional": [
        "questionOptional"
      ],
      'questionSaved': 'Yes'
    },
    {
      pageIndex: '7',
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
  ]
}
