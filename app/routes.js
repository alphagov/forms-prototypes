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

// Renders the page editor, set to a specific page
router.get('/form-designer/edit-page/:pageId', function (req, res) {
  var action = req.session.data.action
  var pageId = req.params.pageId
  var editNextPageId = parseInt(pageId) + 1
  var enableMultipleChoiceAnswerType =
    process.env.ENABLE_MULTIPLE_CHOICE_ANSWER_TYPE === 'true'

  var enableNumberAnswerType =
    process.env.ENABLE_NUMBER_ANSWER_TYPE === 'true'

  // Update the 'Highest page Id'
  req.session.data.highestPageId = req.session.data.pages.length
  var createNextPageId = parseInt(req.session.data.highestPageId) + 1

  // If user is creating a page from the check your answers page...
  if (pageId == 'check-answers' && action == 'createNextPage') {
    res.redirect('/form-designer/edit-page/' + createNextPageId)

    // If user is updating the check your answers page...
  } else if (
    pageId == 'check-answers' &&
    (action == 'update' || action == '')
  ) {
    res.render('form-designer/edit-check-answers-page')

    // If user is creating a page from the confirmation page...
  } else if (pageId == 'confirmation' && action == 'createNextPage') {
    res.redirect('/form-designer/edit-page/' + createNextPageId)

    // If user is updating the confirmation page...
  } else if (pageId == 'confirmation' && (action == 'update' || action == '')) {
    res.render('form-designer/edit-confirmation-page')

    // If user is updating the start page...
  } else if (pageId == 0 && (action == 'update' || action == '')) {
    res.render('form-designer/edit-start-page')

    // If user pressed the 'Create next page' button...
  } else if (action == 'createNextPage') {
    res.redirect('/form-designer/choose-page-type/' + createNextPageId)

    // If user pressed the 'Edit next page' button...
  } else if (action == 'editNextPage') {
    // reset the action to avoid a loop
    req.session.data.action = ''

    res.redirect('/form-designer/edit-page/' + editNextPageId)

    // If user pressed the 'Update preview' button or back link...
  } else if (action === 'deletePage') {
    // reset the action to avoid a loop
    req.session.data.action = ''
    return res.redirect(`/form-designer/delete/${pageId}`)
  } else {
    // If user pressed the 'Update preview' button or back link...
    var pageIndex = parseInt(pageId) - 1
    var pageData = req.session.data.pages[pageIndex]

    res.render('form-designer/edit-page', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      editingExistingQuestion: req.session.data.pages[pageIndex] !== undefined,
      enableMultipleChoiceAnswerType,
      enableNumberAnswerType
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
  res.redirect(`/form-designer/edit-page/${req.params.pageId}`)
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

router.get('/form-designer/returning', (req, res) => {
  req.session.data = returningSessionDataDefaultsA11y
  res.redirect('/form-designer/form-list-a11y')
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
      res.redirect('email-confirmation')
    }
  }
})

module.exports = router
