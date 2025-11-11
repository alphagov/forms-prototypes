/*

This is an example of a complete form - not made live

*/

module.exports = {
  "id": 1,
  "form_id": 1313,
  "tag": "draft",
  "content": {
    "name": 'What a wonderful test form',
    "steps": [
      {
        "pageIndex": "0",
        "data": {
          "hint_text": "",
          "answer_type": "name",
          "is_optional": null,
          "page_heading": null,
          "question_text": "What is your name?",
          "answer_settings": {
            "input_type": "full_name",
            "title_needed": "false"
          },
          "guidance_markdown": null
        },
        "type": "question_page",
        "position": 1,
        "routing_conditions": []
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
    ]
  },
  "question_section_completed": true,

  "declaration_text": null,
  "declaration_section_completed": true,

  "what_happens_next_markdown": "We will update your claim with the new information you provided. We aim to do this within 10 working days. After we have updated your information, we will let you know if you are due a payment. You do not need to send us any further evidence to complete your application.\n\nIf you have not had a response from us within 15 working days, contact us at: [redundancypaymentsonline@insolvency.gov.uk](mailto:redundancypaymentsonline@insolvency.gov.uk)\n\nMake sure you have told the insolvency practitioner handling your employer’s insolvency about the changes you have made to your claim information. They may need to change the information they provided the Insolvency Service.\n\nTo make another amendment to your redundancy claim, complete the relevant form from the [redundancy claim amendment forms](https://www.gov.uk/guidance/amend-a-redundancy-claim) page.",

  "payment_url": null,

  "submission_type": 'email', // or 'email_with_csv'
  "submission_email": '',

  "privacy_policy_url": null,

  "support_email": null,
  "support_phone": null,
  "support_url": null,
  "support_url_text": null,

  "share_preview_completed": false
}
