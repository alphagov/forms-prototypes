const path = require('path')
const express = require('express')
const { setPageIndexToArrayPosition } = require('../lib/utils.js')
const sessionDataDefaults = require('./data/session-data-defaults.js')
const returningSessionDataDefaults = require('./data/returning-session-data-defaults')
const returningSessionDataDefaultsA11y = require('./data/returning-session-data-defaults-a11y')
const router = express.Router()

// ROUTES FOR EXAMPLE FORMS

// Run this code when a form is submitted to '/example-2/eligibility-check-answer'
router.post('/example-2/eligibility-check-answer', function (req, res) {
  // Make a variable and give it the value from 'where-do-you-live'
  var whereDoYouLive = req.session.data['where-do-you-live']

  // Check whether the variable matches a condition
  if (whereDoYouLive == 'Northern Ireland') {
    // Send user to ineligible page
    res.redirect('/example-2/ineligible')
  } else {
    // Send user to next page
    res.redirect('/example-2/question-1')
  }
})

// Run this code when a form is submitted to '/example-2/save-progress-check'
router.post('/example-2/save-progress-check', function (req, res) {
  // Make a variable and give it the value from 'save-progress'
  var saveProgress = req.session.data['save-progress']

  // Check whether the variable matches a condition
  if (saveProgress == 'no') {
    // Send user to ineligible page
    res.redirect('/example-2/task-list')
  } else {
    // Send user to next page
    res.render('example-2/save-progress-check')
  }
})

// ROUTES FOR FORM DESIGNER

router.use('/form-designer/*', function (req, res, next) {
  const referer = req.headers.referer ?? '';
  req.session.data.referer = referer
  next();
})

// Renders the answer type editor, set to a specific page
router.get('/form-designer/edit-answer-type/:pageId', function (req, res) {
  var action = req.session.data.action
  var pageId = req.params.pageId
  var pageIndex = parseInt(pageId) - 1
  var pageData = req.session.data.pages[pageIndex]

  // Update the 'Highest page Id'
  req.session.data.highestPageId = req.session.data.pages.length

  if (action == 'editPage') {
    // if user pressed 'Save and continue' button...
    res.redirect('/form-designer/edit-page/' + pageId)
  } else {
    res.render('form-designer/edit-answer-type', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      editingExistingQuestion: req.session.data.pages[pageIndex] !== undefined
    })
  }
})

// Renders the page editor, set to a specific page
router.get('/form-designer/edit-page/:pageId', function (req, res) {
  var action = req.session.data.action
  var pageId = req.params.pageId
  var editNextPageId = parseInt(pageId) + 1
  var enableMultipleChoiceAnswerType =
    process.env.ENABLE_MULTIPLE_CHOICE_ANSWER_TYPE === 'true'

  // Update the 'Highest page Id'
  req.session.data.highestPageId = req.session.data.pages.length
  var createNextPageId = parseInt(req.session.data.highestPageId) + 1

  // Edit declaration (CYA) page errors
  if (pageId == 'check-answers') {
    const errors = {};
    const { isDeclarationComplete } = req.session.data

    // If declaration is blank, create an error to be displayed to the user
    // if (!checkAnswersDeclaration?.length) {
    //   errors.checkAnswersDeclaration = {
    //     text: 'Enter a declaration',
    //     href: "#checkAnswersDeclaration"
    //   }
    // }

    // Confirm if task is completed or not on declaration page
    if (!isDeclarationComplete || !isDeclarationComplete.length) {
      errors['isDeclarationComplete'] = {
        text: 'Select no if you want to complete this section later',
        href: "#isDeclarationComplete"
      }
    }

    // Convert the errors into a list, so we can use it in the template
    const errorList = Object.values(errors)
    // If there are no errors, redirect the user to the next page
    // otherwise, show the page again with the errors set
    const containsErrors = errorList.length > 0
    if(containsErrors && action !== 'gogogo' && action !== '') {
      // Reset the state so they can be reused
      req.session.data.action = undefined
      res.render('form-designer/edit-check-answers-page', { errors, errorList, containsErrors })
    } else if(action == 'continue') {
      // Reset the state so they can be reused
      req.session.data.action = undefined
      res.redirect('/form-designer/create-form')
    } else {
      res.render('form-designer/edit-check-answers-page')
    }

  } else if (pageId == 'confirmation') {
    // If user is updating the confirmation page...
    const errors = {};
    const { confirmationNext } = req.session.data

    // If the formsEmail is blank, create an error to be displayed to the user
    if (!confirmationNext?.length) {
      errors.confirmationNext = {
        text: 'Enter what happens next',
        href: "#confirmationNext"
      }
    }

    // Convert the errors into a list, so we can use it in the template
    const errorList = Object.values(errors)
    // If there are no errors, redirect the user to the next page
    // otherwise, show the page again with the errors set
    const containsErrors = errorList.length > 0
    if(containsErrors && action !== 'gogogo' && action !== '') {
      // Reset the state so they can be reused
      req.session.data.action = undefined
      res.render('form-designer/edit-confirmation-page', { errors, errorList, containsErrors })
    } else if(action == 'continue') {
      // Reset the state so they can be reused
      req.session.data.action = undefined
      res.redirect('/form-designer/create-form')
    } else {
      res.render('form-designer/edit-confirmation-page')
    }

  } else if (pageId == 0 && (action == 'update' || action == '')) {
    // If user is updating the start page...
    res.render('form-designer/edit-start-page')

  } else if (action == 'createNextPage') {
    // If user pressed the 'Create next page' button...
    var pageId = req.params.pageId
    var pageIndex = parseInt(pageId) - 1

    req.session.data.action = '' // reset the action to avoid a loop

    if ((req.session.data.pages[pageIndex]['addAnother'] === 'group') && ((req.session.data.pages[pageIndex]['group'] === '') || (!req.session.data.pages[pageIndex]['group']))) {
      // if create question group radio selected
      res.redirect('/form-designer/choose-question-group/' + pageId)
    } else {
      // if 'individual' or 'no' loop radio selected continue to next page
      res.redirect('/form-designer/choose-page-type/' + createNextPageId)
    }

  } else if (action == 'editNextPage') {
    // If user pressed the 'Save and edit next page' button...
    var pageId = req.params.pageId
    var pageIndex = parseInt(pageId) - 1

    req.session.data.action = '' // reset the action to avoid a loop

    if ((req.session.data.pages[pageIndex]['addAnother'] === 'group') && ((req.session.data.pages[pageIndex]['group'] === '') || (!req.session.data.pages[pageIndex]['group']))) {
      // if create question group radio selected
      res.redirect('/form-designer/choose-question-group/' + pageId)
    } else {
      res.redirect('/form-designer/edit-page/' + editNextPageId)
    }

  } else if (action === 'deletePage') {
    // If user pressed 'Delete question' button
    req.session.data.action = '' // reset the action to avoid a loop
    return res.redirect(`/form-designer/delete/${pageId}`)

  } else if (action === 'addAnother') {
    // If user pressed the 'Add another option' button
    var pageIndex = parseInt(pageId) - 1
    var pageData = req.session.data.pages[pageIndex]
    var itemList = req.session.data.pages[pageIndex]['item-list'] // get options list

    var lastItem = itemList.length - 1 // get list length
    // add an empty item to option list array, so it gives a new input on the screen
    if (itemList[lastItem]) {
      itemList.push("")
    }

    req.session.data.action = '' // reset the action to avoid a loop
    res.render('form-designer/edit-page', {
      pageId: pageId,
      pageIndex: pageIndex,
      typeData: req.session.data.pages.type,
      pageData: pageData,
      editingExistingQuestion: req.session.data.pages[pageIndex] !== undefined,
      enableMultipleChoiceAnswerType
    })

  } else if (action.includes('removeOption')) {
    // If user pressed 'Remove' button next to select option (checkbox/radio)
    var pageIndex = parseInt(pageId) - 1 // get page array index
    var pageData = req.session.data.pages[pageIndex] // get page data from array

    var itemList = req.session.data.pages[pageIndex]['item-list']
    var remove = req.session.data.action.split("-") // return option and index of item to remove as an array
    var itemToRemove = remove.pop() // gets the 2nd object from returned option, leaving us with the index of the item

    if (itemToRemove > -1) { // only splice array when item is found
      if (itemList.length <= 2) {
        itemList.push("")
      }
      itemList.splice(itemToRemove, 1); // 2nd parameter means remove one item only
    }

    req.session.data.action = '' // reset the action to avoid a loop

    res.render('form-designer/edit-page', {
      pageId: pageId,
      pageIndex: pageIndex,
      typeData: req.session.data.pages.type,
      pageData: pageData,
      editingExistingQuestion: req.session.data.pages[pageIndex] !== undefined,
      enableMultipleChoiceAnswerType
    })

  } else {
    // If user pressed 'Update preview' button or back link...
    var pageIndex = parseInt(pageId) - 1
    var pageData = req.session.data.pages[pageIndex]

    res.render('form-designer/edit-page', {
      pageId: pageId,
      pageIndex: pageIndex,
      typeData: req.session.data.pages.type,
      pageData: pageData,
      editingExistingQuestion: req.session.data.pages[pageIndex] !== undefined,
      enableMultipleChoiceAnswerType
    })
  }
})

// Renders the question group selection, set to a specific page
router.get('/form-designer/choose-question-group/:pageId', function (req, res) {
  var action = req.session.data.action // get button pressed action
  var pageId = req.params.pageId // get current page ID
  var pageIndex = parseInt(pageId) - 1 // get page array index
  var pageData = req.session.data.pages[pageIndex] // get page data from array

  if (action === 'newGroup') {
    // If user pressed 'Create a new group' button...
    req.session.data.action = '' // reset the action to avoid a loop
    res.redirect('/form-designer/create-question-group/' + pageId)

  } else if (action === 'addToGroup') {
    // If user has chosen a question group to add question to...

    var questionGroup = req.session.data.questionGroup // get the chosen radio - group name

    // add group to page object
    if (questionGroup) {
      Object.assign(pageData, { 'group': questionGroup })
    }

    req.session.data.action = '' // reset the action to avoid a loop

    // then go back to edit question page
    res.redirect('/form-designer/edit-page/' + pageId)

  } else {
    req.session.data.action = '' // reset the action to avoid a loop
    res.render('form-designer/choose-question-group', {
      pageId: pageId,
      pageIndex: pageIndex,
      typeData: req.session.data.pages.type,
      pageData: pageData
    })
  }
})

// Renders the question group creation, set to a specific page
router.get('/form-designer/create-question-group/:pageId', function (req, res) {
  var action = req.session.data.action // get button pressed action
  var pageId = req.params.pageId // get current page ID
  var pageIndex = parseInt(pageId) - 1 // get page array index
  var pageData = req.session.data.pages[pageIndex] // get page data from array

  if (action == 'addToGroup') {
    // If user pressed 'Save and continue' button...
    req.session.data.action = '' // reset the action to avoid a loop
    req.session.data.highestGroupId += 1 // increase highest group ID ready for next group to be added

    // add temporary input data to an array object in "groups" array
    req.session.data.groups.push(
      {
        "name": req.session.data['group-name'],
        "add-loop-min": req.session.data['group-loop-min'],
        "add-loop-max": req.session.data['group-loop-max']
      }
    )

    delete req.session.data['group-name'] // remove temporary data
    delete req.session.data['group-loop-min'] // remove temporary data
    delete req.session.data['group-loop-max'] // remove temporary data

    // go back to group radio selection page
    res.redirect('/form-designer/choose-question-group/' + pageId)

  } else {
    req.session.data.action = '' // reset the action to avoid a loop

    res.render('form-designer/create-question-group', {
      pageId: pageId,
      groupIndex: req.session.data.highestGroupId
    })
  }
})

// Route used to delete question
router.get('/form-designer/delete/:pageId/', function (
  req,
  res
) {
  const { action } = req.session.data
  const pageIndex = parseInt(req.params.pageId, 10) - 1
  const pageData = req.session.data.pages[pageIndex]

  if(!(pageIndex in req.session.data.pages)) {
    throw Error('Page not found');
  }

  if(action === 'delete' && req.session.data.delete === 'Yes') {
    // Create an array of pages without the one we want to remove
    const pages = req.session.data.pages
      .filter(element => parseInt(element.pageIndex, 10) !== pageIndex)
      .map(setPageIndexToArrayPosition)

    // Save the pages
    req.session.data.pages = pages
    // Update the highestPageId so when user creates a new question after
    // deleting the right id is used
    req.session.data.highestPageId = req.session.data.pages.length

    // Reset the state so they can be reused
    req.session.data.action = undefined
    req.session.data.delete = undefined
    return res.redirect('/form-designer/form-index')
  } else if(action === 'delete' && req.session.data.delete === 'No') {
    // Reset the state so they can be reused
    req.session.data.action = undefined
    req.session.data.delete = undefined
    return res.redirect(`/form-designer/edit-page/${pageIndex + 1}`)
  } else {

    res.render('form-designer/delete.html', {
      pageData
    })
  }
})


// Route used by the reordering buttons in form-index.html
router.get('/form-designer/reorder-page/:pageId/:direction', function (
  req,
  res
) {
  const { pageId, direction } = req.params
  const newArrayPosition = direction === 'down' ? pageId : pageId - 2
  const { pages } = req.session.data

  const pageToMove = pages.splice(pageId - 1, 1)[0]
  pages.splice(newArrayPosition, 0, pageToMove)

  req.session.data.pages = pages.map(setPageIndexToArrayPosition)

  res.redirect('/form-designer/form-index')
})

// Renders the page type chooser, set to a specific page
router.get('/form-designer/choose-page-type/:pageId', function (req, res) {
  req.session.data.action = ''
  res.redirect(`/form-designer/edit-answer-type/${req.params.pageId}`)
})

// Renders the in-page preview, set to a specific page
router.get('/form-designer/page-preview/:pageId', function (req, res) {
  req.session.data.action = ''
  var pageId = req.params.pageId
  var pageIndex = parseInt(pageId) - 1
  var pageData = req.session.data.pages[pageIndex]

  res.render('form-designer/page-preview', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
})

// Renders the new-tab page preview, set to a specific page
router.get('/form-designer/page-preview-new-tab/:pageId', function (req, res) {
  req.session.data.action = ''
  var pageId = req.params.pageId
  var pageIndex = parseInt(pageId) - 1
  var pageData = req.session.data.pages[pageIndex]

  res.render('form-designer/page-preview-new-tab', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
})

// Renders the page which asks for form name, handling validation errors
router.post('/form-designer/form-create-a-form', function (req, res) {
  const errors = {};
  const { formTitle } = req.session.data

  // If the formTitle is blank, create an error to be displayed to the user
  if (!formTitle || !formTitle.length) {
    errors['formTitle'] = {
      text: 'Enter a form name',
      href: "#form-title"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/form-create-a-form', { errors, errorList, containsErrors })
  } else {
    res.redirect('create-form')
  }
})

// Routing for return journey testing - 'Amendment form: redundancy claim for holiday pay', Insolvency Service form
router.get('/form-designer/returning', (req, res) => {
  req.session.data = returningSessionDataDefaultsA11y
  res.redirect('/form-designer/form-list-a11y')
})

// Routing for return journey testing - 'Take your pet abroad' form
router.get('/form-designer/returning-again', (req, res) => {
  req.session.data = returningSessionDataDefaults
  res.redirect('/form-designer/form-list')
})


// Routing for publishing steps

// Renders the page which asks for form submissions email address, handling validation errors
router.post('/form-designer/completed-forms-email/set-completed-forms-email', function (req, res) {
  const errors = {};
  const { formsEmail, currentFormsEmail } = req.session.data

  // If the formsEmail is blank, create an error to be displayed to the user
  if (!formsEmail?.length) {
    errors.formsEmail = {
      text: 'Enter an email address',
      href: "#forms-email"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/completed-forms-email/set-completed-forms-email', { errors, errorList, containsErrors })
  } else {
    if(currentFormsEmail && (currentFormsEmail != formsEmail)) {
      res.redirect('change-email-address')
    } else {
      res.redirect('confirmation-code-sent')
    }
  }
})

// Renders the page which asks to confirm wanting to change submission email address, handling validation errors
router.post('/form-designer/completed-forms-email/change-email-address', function (req, res) {
  const errors = {};
  const { changeFormsEmail } = req.session.data

  // If the changeFormsEmail has selection, create an error to be displayed to the user
  if (!changeFormsEmail || !changeFormsEmail.length) {
    errors['formsEmail'] = {
      text: 'Select yes if you want to change the email',
      href: "#forms-email"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/completed-forms-email/change-email-address', { errors, errorList, containsErrors })
  } else {
    if(changeFormsEmail === 'yes') {
      res.redirect('confirmation-code-sent')
    } else {
      res.redirect('set-completed-forms-email')
    }
  }
})

// Renders the page which asks for email confirmation code, handling validation errors
router.post('/form-designer/completed-forms-email/add-confirmation-code', function (req, res) {
  const errors = {};
  const { formsEmail, confirmationCode } = req.session.data

  // If the confirmationCode is blank, create an error to be displayed to the user
  if (!confirmationCode?.length) {
    errors.confirmationCode = {
      text: 'Enter the confirmation code',
      href: "#confirmation-code"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/completed-forms-email/add-confirmation-code', { errors, errorList, containsErrors })
  } else {
    if(confirmationCode === '000000') {
      res.redirect('confirmation-code-expired')
    } else {
      res.redirect('email-confirmation')
    }
  }
})


// Renders the page which asks to confirm editing live questions/form, handling validation errors
router.post('/form-designer/are-you-sure-you-want-to-edit-live-questions', function (req, res) {
  const errors = {};
  const { editLiveQuestions } = req.session.data

  // If the changeFormsEmail has selection, create an error to be displayed to the user
  if (!editLiveQuestions || !editLiveQuestions.length) {
    errors['editLiveQuestions'] = {
      text: 'Select no if you do not want to edit your questions',
      href: "#editLiveQuestions"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/are-you-sure-you-want-to-edit-live-questions', { errors, errorList, containsErrors })
  } else {
    if(editLiveQuestions === 'yes') {
      res.redirect('form-index')
    } else {
      res.redirect('create-form')
    }
  }
})


// Renders the page to confirm making form Live, handling validation errors
router.post('/form-designer/make-your-form-live', function (req, res) {
  const errors = {};
  const { makeFormLive } = req.session.data

  // If the user haven't selected yes or no
  if (!makeFormLive || !makeFormLive.length) {
    errors['makeFormLive'] = {
      text: 'Select no if you do not want to make your form live yet',
      href: "#makeFormLive"
    }
  }
  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/make-your-form-live', { errors, errorList, containsErrors })
  } else {
    if(makeFormLive === 'yes') {
      req.session.data.status = "Live"
      res.redirect('form-is-live')
    } else {
      res.redirect('create-form')
    }
  }
})


// Renders the page for creator to add privacy information link, handling validation errors
router.post('/form-designer/provide-link-to-privacy-information', function (req, res) {
  const errors = {};
  const { privacyInformation } = req.session.data

  // If the privacyInformation is blank, create an error to be displayed to the user
  if (!privacyInformation?.length) {
    errors['privacyInformation'] = {
      text: 'Enter a link to privacy information',
      href: "#privacy-information"
    }
  }
  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/provide-link-to-privacy-information', { errors, errorList, containsErrors })
  } else {
    res.redirect('create-form')
  }
})


// Renders the page for creator to add support contacts, handling validation errors
router.post('/form-designer/provide-support-details', function (req, res) {
  const errors = {};
  const { supportDetails, emailSupport, phoneSupport, onlineSupportLink, onlineSupportText } = req.session.data

  console.log(supportDetails)

  // If the user hasn't selected an option
  if (!supportDetails?.length) {
    errors['supportDetails'] = {
      text: 'Select at least one option',
      href: "#support-details"
    }
  }
  // If the user has selected email but hasn't entered an email
  if (supportDetails?.includes('email') && !emailSupport?.length) {
    errors['emailSupport'] = {
      text: 'Enter an email address',
      href: "#email-support"
    }
  }
  // If the user has selected telephone but hasn't entered any detail
  if (supportDetails?.includes('phone') && !phoneSupport?.length) {
    errors['phoneSupport'] = {
      text: 'Enter a phone number and opening hours',
      href: "#email-support"
    }
  }
  // If the user has selected online but hasn't entered a link
  if (supportDetails?.includes('online') && !onlineSupportLink?.length) {
    errors['onlineSupportLink'] = {
      text: 'Enter an online contact link',
      href: "#email-support"
    }
  }
  // If the user has selected online but hasn't entered any descriptive text for the link
  if (supportDetails?.includes('online') && !onlineSupportText?.length) {
    errors['onlineSupportText'] = {
      text: 'Enter an online contact link description',
      href: "#email-support"
    }
  }
  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/provide-support-details', { errors, errorList, containsErrors })
  } else {
    res.redirect('create-form')
  }
})

module.exports = router
