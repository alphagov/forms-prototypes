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
//

router.use('/form-designer/*', function (req, res, next) {
  const referer = req.headers.referer ?? '';
  req.session.data.referer = referer
  next();
})

router.get('/form-designer/edit-answer-type/:pageId', function (req, res) {
  var action = req.session.data.action
  var pageId = req.params.pageId

  // If user pressed the 'Update preview' button or back link...
  var pageIndex = parseInt(pageId) - 1
  var pageData = req.session.data.pages[pageIndex]

  // Update the 'Highest page Id'
  req.session.data.highestPageId = req.session.data.pages.length

  if (action == 'editPage') {
    req.session.data.action = undefined
    if (pageData['type'] === 'personName') {
      // person's name route
      res.redirect('/form-designer/settings/' + pageId)
    } else if (pageData['type'] === 'address') {
      // address route
      res.redirect('/form-designer/settings/' + pageId)
    } else if (pageData['type'] === 'date') {
      // date route
      res.redirect('/form-designer/settings/' + pageId)
    } else if (pageData['type'] === 'select') {
      // selection from a list route
      res.redirect('/form-designer/settings/' + pageId)
    } else if (pageData['type'] === 'text') {
      // text route
      res.redirect('/form-designer/settings/' + pageId)
    } else {
      res.redirect('/form-designer/edit-page/' + pageId)
    }
  } else {
    req.session.data.action = undefined
    res.render('form-designer/edit-answer-type', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      editingExistingQuestion: req.session.data.pages[pageIndex] !== undefined
    })
  }
})

router.get('/form-designer/settings/:pageId', function (req, res) {
  var action = req.session.data.action
  var pageId = req.params.pageId
  var enableMultipleChoiceAnswerType =
    process.env.ENABLE_MULTIPLE_CHOICE_ANSWER_TYPE === 'true'

  // If user pressed the 'Update preview' button or back link...
  var pageIndex = parseInt(pageId) - 1
  var pageData = req.session.data.pages[pageIndex]

  // Update the 'Highest page Id'
  // req.session.data.highestPageId = req.session.data.pages.length

  if (req.session.data.input) {
    pageData['input'] = req.session.data.input
    req.session.data.input = undefined
  }
  if (req.session.data.title) {
    pageData['title'] = req.session.data.title
    req.session.data.title = undefined
  }

  if (req.session.data['item-list']) {
    var itemList = req.session.data['item-list']
    var lastItem = itemList.length - 1
    if (itemList[lastItem] === '') {
      itemList.pop()
    }
    pageData['item-list'] = itemList
    pageData['oneOption'] = req.session.data['oneOption']
    req.session.data['item-list'] = undefined
    req.session.data.oneOption = undefined
  }

  if (action === 'addAnother') {

    if (itemList[lastItem]) {
      itemList.push("")
    }

    // reset the action to avoid a loop
    req.session.data.action = undefined

    res.render('form-designer/settings', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      editingExistingQuestion: req.session.data.pages[pageIndex] !== undefined
    })
  } else if (action.includes('removeOption')) {
    var remove = req.session.data.action.split("-")
    var itemToRemove = remove.pop()

    if (itemToRemove > -1) { // only splice array when item is found
      if (itemList.length <= 2) {
        itemList.push("")
      }
      itemList.splice(itemToRemove, 1); // 2nd parameter means remove one item only
    }

    // reset the action to avoid a loop
    req.session.data.action = undefined

    res.render('form-designer/settings', {
      pageId: pageId,
      pageIndex: pageIndex,
      typeData: req.session.data.pages.type,
      pageData: pageData,
      editingExistingQuestion: req.session.data.pages[pageIndex] !== undefined,
      enableMultipleChoiceAnswerType
    })

  } else if (action == 'editPage') {
    req.session.data.action = undefined
    res.redirect('/form-designer/edit-page/' + pageId)
  } else {
    req.session.data.action = undefined
    res.render('form-designer/settings', {
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
  // req.session.data.highestPageId = req.session.data.pages.length
  var createNextPageId = parseInt(req.session.data.highestPageId) + 1

  var pageIndex = parseInt(pageId) - 1
  var pageData = req.session.data.pages[pageIndex]

  if (req.session.data['long-title']) {
    pageData['long-title'] = req.session.data['long-title']
    req.session.data['long-title'] = undefined
  }
  if (req.session.data['hint-text']) {
    pageData['hint-text'] = req.session.data['hint-text']
    req.session.data['hint-text'] = undefined
  }
  if (req.session.data['questionOptional']) {
    pageData['questionOptional'] = req.session.data['questionOptional']
    req.session.data['questionOptional'] = undefined
  }

  // Edit declaration page errors
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

    // If user is updating the confirmation page...
  } else if (pageId == 'confirmation') {
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

    // If user is updating the start page...
  } else if (pageId == 0 && (action == 'update' || action == '')) {
    res.render('form-designer/edit-start-page')

    // If user pressed the 'Create next page' button...
  } else if (action == 'createNextPage') {
    res.redirect('/form-designer/choose-page-type/' + createNextPageId)

    // If user pressed the 'Edit next page' button...
  } else if (action == 'editNextPage') {
    // reset the action to avoid a loop
    req.session.data.action = undefined

    res.redirect('/form-designer/edit-page/' + editNextPageId)

    // If user pressed the 'Update preview' button or back link...
  } else if (action === 'deletePage') {
    // reset the action to avoid a loop
    req.session.data.action = undefined
    return res.redirect(`/form-designer/delete/${pageId}`)

  } else {
    // If user pressed the 'Update preview' button or back link...
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



// If user is marking questions as complete...
router.get('/form-designer/question-list', function (
  req,
  res
) {
  const errors = {};
  const { isQuestionsComplete } = req.session.data

  // If the formsEmail is blank, create an error to be displayed to the user
  if (!isQuestionsComplete?.length) {
    errors.isQuestionsComplete = {
      text: 'Select ‘Yes’ if you are finished adding and editing your questions',
      href: "#isQuestionsComplete"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    // Reset the state so they can be reused
    req.session.data.action = undefined
    res.render('form-designer/form-index', { errors, errorList, containsErrors })
  } else {
    // Reset the state so they can be reused
    req.session.data.action = undefined
    res.redirect('/form-designer/create-form')
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
  req.session.data.action = undefined
  res.redirect(`/form-designer/edit-answer-type/${req.params.pageId}`)
})

// Renders the in-page preview, set to a specific page
router.get('/form-designer/page-preview/:pageId', function (req, res) {
  req.session.data.action = undefined
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
  req.session.data.action = undefined
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

router.get('/form-designer/returning', (req, res) => {
  req.session.data = returningSessionDataDefaultsA11y
  res.redirect('/form-designer/form-list-a11y')
})

router.get('/form-designer/returning-again', (req, res) => {
  req.session.data = returningSessionDataDefaults
  res.redirect('/form-designer/form-list')
})


// Routing for publishing steps

// Renders the page which asks for form submissions email address, handling validation errors
router.post('/form-designer/completed-forms-email/set-completed-forms-email', function (req, res) {
  const errors = {};
  const { formsEmail, currentFormsEmail } = req.session.data

  if (formsEmail.includes(formsEmail)) {
    req.session.data.oldFormsEmail = req.session.data.currentFormsEmail
    req.session.data.currentFormsEmail = formsEmail
  }

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

  if (changeFormsEmail === 'no') {
    req.session.data.formsEmail = req.session.data.oldFormsEmail
    req.session.data.currentFormsEmail = req.session.data.formsEmail
    req.session.data.oldFormsEmail = undefined
  }

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
      req.session.data.confirmationCode = undefined
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

  // If the formsEmail is blank, create an error to be displayed to the user
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
      req.session.data.oldFormsEmail = undefined
      req.session.data.currentFormsEmail = req.session.data.formsEmail
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

  // If the user haven't selected yes or no
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

// Function to remove individual data items, for basic testing
router.get('/prototype-admin/show-data', (req, res, next) => {
  const removeKey = req.session.data.action
  req.session.data[removeKey] = undefined
  next()
})

module.exports = router
