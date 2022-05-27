const express = require('express')
const { setPageIndexToArrayPosition } = require('../lib/utils.js')
const returningSessionDataDefaults = require('./data/returning-session-data-defaults')
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

// Set a value to use in the back button to return to previous page
router.use('/form-designer/*', function (req, res, next) {
  const referer = req.headers.referer ?? '';
  // Should validate the referer URL is part of our application
  req.session.data.referer = referer
  next();
})

// Create a new page
router.get('/form-designer/pages/new', function (req, res) {
  const nextPageId = req.session.data.pages.length
  res.redirect(`/form-designer/pages/${nextPageId}/edit`) 
})

// Edit a user-created page

router.post('/form-designer/pages/:pageId(\\d+)/edit', function (req, res) {
  var action = req.session.data.action
  // clear the action so it doesn't change the next page load
  req.session.data.action = undefined

  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var editNextPageId = pageId + 1
  // No need to validate if the user wants to delete this page anyway
  if (action === 'deletePage') {
    return res.redirect(`delete`)
  }

  const errors = {};
  const title = req.session.data.pages[pageId]['long-title']

  if (!title || !title.length) {
    errors['long-title'] = {
      text: 'Enter question text',
      href: "#long-title"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/pages/edit', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      editingExistingQuestion: req.session.data.pages[pageIndex] !== undefined,
      errors,
      errorList,
      containsErrors 
    })
  } else if (action == 'createNextPage') {
      return res.redirect(`/form-designer/pages/new`)
  } else if (action == 'editNextPage') {
    return res.redirect(`/form-designer/pages/${editNextPageId}/edit`)
  } else {
    return res.redirect(req.path)
  }
})

router.get('/form-designer/pages/:pageId(\\d+)/edit', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]
  return res.render('form-designer/pages/edit', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    editingExistingQuestion: req.session.data.pages[pageIndex] !== undefined
  })
})

// Route used to delete question
router.post('/form-designer/pages/:pageId/delete', function (req, res) {
  const { action } = req.session.data
  const pageIndex = parseInt(req.params.pageId, 10)
  const shouldDelete = req.session.data.delete
  req.session.data.action = undefined
  req.session.data.delete = undefined

  if(!(pageIndex in req.session.data.pages)) {
    throw Error('Page not found');
  }

  if(action === 'delete' && shouldDelete === 'Yes') {
    // Create an array of pages without the one we want to remove
    const pages = req.session.data.pages
      .filter(element => parseInt(element.pageIndex, 10) !== pageIndex)
      .map(setPageIndexToArrayPosition)

    // Save the pages
    req.session.data.pages = pages
    return res.redirect('/form-designer/form-index')
  } else if(action === 'delete' && shouldDelete  === 'No') {
    return res.redirect(`/form-designer/pages/${pageIndex}/edit`)
  } else {
    return res.redirect(req.path)
  }
})

router.get('/form-designer/pages/:pageId/delete', function (req, res) {
  const pageIndex = parseInt(req.params.pageId, 10)
  const pageData = req.session.data.pages[pageIndex]

  if(!(pageIndex in req.session.data.pages)) {
    throw Error('Page not found');
  }

  res.render('form-designer/pages/delete.html', {
    pageData
  })
})

// This is just for convience to to the new-tab preview for this page
router.get('/form-designer/pages/:pageId/view', function (req, res) {
  return res.redirect(`/form-designer/view/${req.params.pageId}`)
});

// Route used by the reordering buttons in form-index.html
router.get('/form-designer/pages/:pageId/reorder/:direction', function (req, res) {
  const { pageId, direction } = req.params
  const newArrayPosition = direction === 'down' ? pageId : pageId - 2
  const { pages } = req.session.data

  const pageToMove = pages.splice(pageId - 1, 1)[0]
  pages.splice(newArrayPosition, 0, pageToMove)

  req.session.data.pages = pages.map(setPageIndexToArrayPosition)

  res.redirect('/form-designer/form-index')
})

// Renders the in-page preview, set to a specific page
router.get('/form-designer/pages/:pageId/preview', function (req, res) {
  req.session.data.action = ''
  var pageId = req.params.pageId
  var pageIndex = parseInt(pageId)
  var pageData = req.session.data.pages[pageIndex]

  res.render('form-designer/pages/preview', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
})

// Renders the new-tab page preview, set to a specific page
router.post('/form-designer/view/:pageId(\\d+)', function (req, res) {
  var pageId = req.params.pageId
  var pageIndex = parseInt(pageId)
  const isLastQuestionPage = pageIndex === (req.session.data.pages.length - 1)

  if(isLastQuestionPage) {
    return res.redirect('check-answers')
  } else {
    return res.redirect(`${pageIndex + 1}`)
  }
});

router.get('/form-designer/view/:pageId(\\d+)', function (req, res) {
  var pageId = req.params.pageId
  var pageIndex = parseInt(pageId)
  var pageData = req.session.data.pages[pageIndex]
  const isLastQuestionPage = pageIndex === (req.session.data.pages.length - 1)

  res.render('form-designer/view/page', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    isLastQuestionPage 
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
    res.redirect('form-index')
  }
})

router.get('/form-designer/returning', (req, res) => {
  req.session.data = returningSessionDataDefaults 
  res.redirect('/form-designer/form-list')
})

module.exports = router
