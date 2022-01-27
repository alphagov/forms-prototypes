const express = require('express')
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

// Renders the page editor, set to a specific page
router.get('/form-designer/edit-page/:pageId', function (req, res) {
  var action = req.session.data.action
  var pageId = req.params.pageId
  var editNextPageId = parseInt(pageId) + 1

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

    const pages = req.session.data.pages
      .filter(element => parseInt(element.pageIndex, 10) !== pageId - 1)
      .map((page, index) => {
        page.pageIndex = index
        return page
      })

    req.session.data.pages = pages

    res.redirect('/form-designer/form-index')
  } else {
    // If user pressed the 'Update preview' button or back link...
    var pageIndex = parseInt(pageId) - 1
    var pageData = req.session.data.pages[pageIndex]

    res.render('form-designer/edit-page', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData
    })
  }
})

// Renders the page type chooser, set to a specific page
router.get('/form-designer/choose-page-type/:pageId', function (req, res) {
  req.session.data.action = ''
  res.render('form-designer/choose-page-type', { pageId: req.params.pageId })
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

module.exports = router
