/* 

This is the latest version of return data for a dummy form to be used in testing Welsh translation: 
created 7 November 2025
testing: week commencing 10 November 2025

*/

module.exports = {

  "groupName": "Account applications",

  /* Dummy form settings */
  "formTitle": "Register for an account",
  "status": "Draft",

  // Form questions
  "highestPageId": 5,
  "pages": [
    {
      "pageIndex": 0,
      "type": "personName",
      "input": "single-field",
      "title": "no",
      "long-title": "What is your full name?",
      "additional-guidance": "Yes",
      "page-name": "How to complete this form",
      "additional-guidance-text": "## When to use this form.\r\n\r\nThis form should be used to register for an account. Please complete a separate form for each person who needs an account.\r\n\r\n## Alternative Forms\r\n\r\nIf you need to register an account for someone under the age of 16, use the [Register an account for a child form](https://www.gov.uk/child-account). \r\n\r\n## Alternative formats\r\n\r\nIf you need a paper version of this form, please visit [Alternative registration formats](https://www.gov.uk/alternative-formats).\r\n",
      "questionSaved": "Yes"
    },
    {
      "pageIndex": 1,
      "type": "date",
      "input": "yes",
      "long-title": "What is your date of birth?",
      "hint-text": "For example, 20 3 2000",
      "additional-guidance": "No",
      "questionSaved": "Yes"
    },
    {
      "pageIndex": 2,
      "type": "address",
      "input": [
        "uk-address"
      ],
      "long-title": "What is your address?",
      "additional-guidance": "No",
      "questionSaved": "Yes"
    },
    {
      "pageIndex": 3,
      "type": "phone",
      "long-title": "What is your phone number?",
      "additional-guidance": "No",
      "questionSaved": "Yes"
    },
    {
      "pageIndex": 4,
      "type": "national-insurance-number",
      "long-title": "What is your National Insurance number?",
      "hint-text": "It’s on your National Insurance card, benefit letter, payslip or P60. For example, QQ 65 43 21 C.",
      "additional-guidance": "No",
      "questionSaved": "Yes"
    },
    {
      "pageIndex": 5,
      "type": "select",
      "long-title": "If you live in Wales, would you like to hear from us in Welsh in future communications?",
      "item-list": [
        "Yes",
        "No",
        "Not applicable"
      ],
      "listSettings": [
        "oneOption"
      ],
      "hint-text": "We will only use this if we contact you for more information.",
      "additional-guidance": "No",
      "questionSaved": "Yes"
    }
  ],
  // questions marked as complete
  "isQuestionsComplete": "yes",

  // check answers declaration marked as complete
  "isDeclarationComplete": "no",
  "checkAnswersDeclaration": "",
  
  // what happens next information marked as complete
  "isConfirmationComplete": "no",
  "confirmationNext": "",

  // payment link added 
  "payments": "no",

  // submission email been added and is complete
  "isSubmissionEmailComplete": "no",
  // submission email confirmation code complete
  "isConfirmationCodeComplete": "no",

  // privacy link added 
  "isPrivacyInformationComplete": "no",

  // supportDetails - emailSupport, phoneSupport, onlineSupportLink, onlineSupportText
  "isSupportDetailsComplete": "no",
  "supportDetails": [
    "online"
  ],
  "emailSupport": "", 
  "phoneSupport": "",
  "onlineSupportText": "Our full contact details",
  "onlineSupportLink": "https://www.gov.uk/contact-us"
}
