//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here


const path = require('path')
const sessionDataDefaults = require('./data/session-data-defaults.js')
const returningSessionDataDefaults = require('./data/returning-session-data-defaults')
const returningSessionDataDefaultsA11y = require('./data/returning-session-data-defaults-a11y')

// Markdown support
const markdown = require('nunjucks-markdown')
const marked = require('marked')

// One time setup
let setupDone = false
router.use((req, res, next) => {
  if (setupDone) return next()

  console.log('routes.js: doing one time setup')
  markdown.register(req.app.get('nunjucksEnv'), marked.parse)
  setupDone = true
  next()
})

// Used for setting the pageIndex in req.session.data.pages to match the order of the pages.
// Should be used after any operation that reorders pages.
setPageIndexToArrayPosition = (page, index) => {
  page.pageIndex = index
  return page
}

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

// =====================================
// ROUTES FOR FORM DESIGNER
// =====================================

// Set a value to use in the back button to return to previous page
router.use('/form-designer/*', function (req, res, next) {
  const referer = req.headers.referer ?? '';
  // Should validate the referer URL is part of our application
  req.session.data.referer = referer
  next();
})

/* =====
Create a new form
===== */

// Edit form name, handling validation errors
router.post('/form-designer/name-your-form', function (req, res) {
  const { formTitle } = req.session.data

  const errors = {};
  // if the formTitle is blank, then error
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
    res.render('form-designer/name-your-form', { errors, errorList, containsErrors })
  } else {
    // set a success message for saving
    req.session.data.successMessage = 'Your form name has been saved'
    res.redirect('your-form')
  }
})

// Your form task list page - used to load and clear out success pageData
// could we also add timer to the notification banner here?
// .govuk-notification-banner__header
router.get('/form-designer/your-form', function (req, res) {
  var successMessage = req.session.data.successMessage
  req.session.data.successMessage = undefined
  return res.render('form-designer/your-form', {
    successMessage: successMessage
  })
})


/* =====
Adding pages to a form
===== */

// .get method to remove empty pages where no answer type has been chosen
// could be removed if we fix the "/pages/new" .get method below
router.get('/form-designer/clear-empty', function (req, res) {
  // remove empty pageData if there is only one object (pageIndex) in array
  const pages = req.session.data.pages.filter(element => {
    if (Object.keys(element).length > 1) {
      return true
    }
    return false
  })
  // Save the pages
  req.session.data.pages = pages

  // reset highestPageId to number of pages
  req.session.data.highestPageId = parseInt(pages.length - 1)

  return res.redirect(`/form-designer/your-questions`)
})

// Your form task list page - used to load and clear out success pageData
// could we also add timer to the notification banner here?
// .govuk-notification-banner__header
router.get('/form-designer/your-questions', function (req, res) {
  var successMessage = req.session.data.successMessage
  req.session.data.successMessage = undefined
  return res.render('form-designer/your-questions', {
    successMessage: successMessage
  })
})

// Route for user marking questions as complete
router.post('/form-designer/your-questions', function (req, res) {
  const { isQuestionsComplete } = req.session.data

  // content to display in notification banners
  var saved = 'Your questions have been saved'
  var savedAndComplete = 'Your questions have been saved and marked as complete'

  const errors = {}
  // if no option is selected, then error
  if (!isQuestionsComplete?.length) {
    errors.isQuestionsComplete = {
      text: 'Select yes if you have finished adding and editing your questions',
      href: "#isQuestionsComplete"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/your-questions', { errors, errorList, containsErrors })
  } else {
    if(isQuestionsComplete === 'yes') {
      // set a success message for saving and marking as complete
      req.session.data.successMessage = savedAndComplete
    } else {
      // set a success message for saving
      req.session.data.successMessage = saved
    }
    res.redirect('/form-designer/your-form')
  }
})


// Create a new page
router.get('/form-designer/pages/new', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  const nextPageId = req.session.data.pages.length

  if (!pageData) {
    req.session.data.pages.push({
      'pageIndex': nextPageId
    })
  }

  res.redirect(`/form-designer/pages/${nextPageId}/edit-answer-type`)
})

// Edit a user-created answer type
router.get('/form-designer/pages/:pageId(\\d+)/edit-answer-type', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var successMessage = req.session.data.successMessage
  req.session.data.successMessage = undefined

  return res.render('form-designer/pages/edit-answer-type', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    successMessage
  })
})

// Route used to find correct next step - answer type > settings page || edit question page
router.post('/form-designer/pages/:pageId(\\d+)/edit-answer-type', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  const type = req.session.data.type
  req.session.data.type = undefined

  const errors = {};
  const complete = req.session.data.isDeclarationComplete

  // if no selection made, then throw an error
  if (!type || !type.length) {
    errors['type'] = {
      text: 'Select the type of answer you need',
      href: "#type"
    }
  } else {
    pageData['type'] = type
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/pages/edit-answer-type', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      errors,
      errorList,
      containsErrors
    })
  } else {
    const nextPageId = req.session.data.pages.length

    if (!pageData) {
      req.session.data.pages.push({
        'pageIndex': nextPageId
      })
    }
    if (type === 'personName') {
      // person's name route
      return res.redirect('edit-settings')
    } else if (type === 'address') {
      // address route
      return res.redirect('edit-settings')
    } else if (type === 'date') {
      // date route
      return res.redirect('edit-settings')
    } else if (type === 'select') {
      // what's your question route
      return res.redirect('edit-select-question')
    } else if (type === 'text') {
      // text route
      return res.redirect('edit-settings')
    } else {
      return res.redirect('edit')
    }
  }
})

// Edit a user-created answer type settings
router.get('/form-designer/pages/:pageId(\\d+)/edit-select-question', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]
  return res.render('form-designer/pages/edit-select-question', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
})

// Route to what is your question page for select from list answer type
router.post('/form-designer/pages/:pageId(\\d+)/edit-select-question', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  const type = req.session.data.type
  req.session.data.type = undefined

  const complete = req.session.data.isDeclarationComplete

  const errors = {};
  const title = req.session.data['long-title']

  // if no question text given, then throw an error
  if (!title || !title.length) {
    errors['long-title'] = {
      text: 'Enter your question',
      href: "#long-title"
    }
  // otherwise add question text to pageData
  } else {
    pageData['long-title'] = req.session.data['long-title']
  }
  req.session.data['long-title'] = undefined

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/pages/edit-select-question', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      errors,
      errorList,
      containsErrors
    })
  } else {
    const nextPageId = req.session.data.pages.length
    res.redirect('edit-settings')
  }
})

// Edit a user-created answer type settings
router.get('/form-designer/pages/:pageId(\\d+)/edit-settings', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]
  return res.render('form-designer/pages/edit-settings', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
})

// Route used to find correct next step - settings page > edit question page
router.post('/form-designer/pages/:pageId(\\d+)/edit-settings', function (req, res) {
  var action = req.session.data.action
  // clear the action so it doesn't change the next page load
  req.session.data.action = undefined

  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  // Get basic errors
  const errors = {};

  // if select option from list and no, or 1, input is given throw error, else add input to pageData
  var itemList = req.session.data['item-list']
  var listSettings = req.session.data['listSettings']

  req.session.data['item-list'] = undefined
  req.session.data['listSettings'] = undefined

  if (pageData['type'] === 'select') {
    const lastItem = itemList.length - 1
    // check for empty values
    const tempList = itemList.filter(element => {
      if (Object.keys(element).length !== 0) {
        return true
      }
      return false
    })
    itemList = tempList
    if (!itemList.length) {
      errors['item-list'] = {
        text: 'Enter at least 2 options',
        href: "#option-0"
      }
    } else if (itemList.length < 2) {
      errors['item-list'] = {
        text: 'Enter at least 2 options',
        href: "#option-0"
      }
    }
    pageData['item-list'] = itemList
    pageData['listSettings'] = listSettings
  } else if (!req.session.data.input || !req.session.data.input.length) {
  // if no input is selected throw error, else add input to pageData
    if (pageData['type'] === 'personName') {
      errors['input'] = {
        text: 'Select how you need to collect the name',
        href: "#input"
      }
    } else if (pageData['type'] === 'address') {
      errors['input'] = {
        text: 'Select the kind of addresses you expect to receive',
        href: "#input"
      }
    } else if (pageData['type'] === 'date') {
      errors['input'] = {
        text: 'Select yes if you’re asking for a date of birth',
        href: "#input"
      }
    } else if (pageData['type'] === 'text') {
      errors['input'] = {
        text: 'Select how much text people will need to provide',
        href: "#input"
      }
    } else {
      errors['input'] = {
        text: 'Select an answer',
        href: "#input"
      }
    }
  } else {
    pageData['input'] = req.session.data.input
  }
  req.session.data.input = undefined

  // if asking for person’s name and title answer not selected throw error, else add input to pageData
  if (pageData['type'] === 'personName') {
    if (!req.session.data.title || !req.session.data.title.length) {
      errors['title'] = {
        text: 'Select yes if you need a title',
        href: "#title"
      }
    } else {
      pageData['title'] = req.session.data.title
    }
  }
  req.session.data.title = undefined

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/pages/edit-settings', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      errors,
      errorList,
      containsErrors
    })
  } else if (action === 'addAnother') {
    const lastItem = itemList.length - 1
    if (itemList[lastItem]) {
      itemList.push("")
    }
    return res.render('form-designer/pages/edit-settings', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData
    })
  } else if (action.includes('removeOption')) {
    // get item position to remove via remove button value
    var remove = action.split("-")
    var itemToRemove = remove.pop()
    // only splice array when item is found
    if (itemToRemove > -1) {
      // if options are now less than 2 add an empty option input
      if (itemList.length <= 2) {
        itemList.push("")
      }
      // 2nd parameter means remove one item only
      itemList.splice(itemToRemove, 1)
    }
    return res.render('form-designer/pages/edit-settings', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData
    })
  } else {
    return res.redirect('edit')
  }
})

// Edit a user-created question
router.get('/form-designer/pages/:pageId(\\d+)/edit', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var successMessage = req.session.data.successMessage
  req.session.data.successMessage = undefined

  return res.render('form-designer/pages/edit', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    successMessage,
    editingExistingQuestion: req.session.data.pages[pageIndex]['long-title'] !== undefined
  })
})

// Route used to find correct next step - edit question page > answer type
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
  const title = req.session.data['long-title']

  // if no question text given, then throw an error
  if (!title || !title.length) {
    errors['long-title'] = {
      text: 'Enter a question',
      href: "#long-title"
    }
  // otherwise add question text to pageData
  } else {
    pageData['long-title'] = req.session.data['long-title']
  }
  req.session.data['long-title'] = undefined

  // if hint text is added, add it to pageData
  if (req.session.data['hint-text']) {
    pageData['hint-text'] = req.session.data['hint-text']
  }
  req.session.data['hint-text'] = undefined

  // if question is made optional, add it to pageData
  if (req.session.data['questionOptional']) {
    pageData['questionOptional'] = req.session.data['questionOptional']
  }
  req.session.data['questionOptional'] = undefined

  // if pageData exists, clear out any unused selections to reduce errors
  if (pageData) {
    // if type is NOT person’s name, remove title from pageData
    if (pageData['type'] !== 'personName') {
      pageData['title'] = undefined
    }
    // if type is NOT select from a list, remove options list and single option selection from pageData
    if (pageData['type'] !== 'select') {
      pageData['item-list'] = undefined
      pageData['listSettings'] = undefined
    }
    // if type does NOT have settings page, remove input from pageData
    if ((pageData['type'] !== 'address') && (pageData['type'] !== 'personName') && (pageData['type'] !== 'date') && (pageData['type'] !== 'text')) {
      pageData['input'] = undefined
    }
  }

  // content to display in notification banners
  var saved = 'Your changes have been saved'
  var saveAndContinue = 'Question ' + (parseInt(pageId) + 1) + ' has been saved'

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
      editingExistingQuestion: req.session.data.pages[pageIndex]['long-title'] !== undefined,
      errors,
      errorList,
      containsErrors
    })
  } else if (action == 'createNextPage') {
    req.session.data.highestPageId = parseInt(req.session.data.highestPageId) + 1
    req.session.data.successMessage = saveAndContinue
    return res.redirect(`/form-designer/pages/new`)
  } else if (action == 'editNextPage') {
    req.session.data.successMessage = saveAndContinue
    return res.redirect(`/form-designer/pages/${editNextPageId}/edit`)
  } else {
    req.session.data.successMessage = saved
    return res.redirect(req.path)
  }
})

/* =====
Managing questions in a form
===== */

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

  const errors = {};
  if (!shouldDelete || !shouldDelete.length) {
    errors['delete'] = {
      text: 'Select yes if you want to delete this question',
      href: "#delete"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/pages/delete', {
      errors,
      errorList,
      containsErrors
    })
  } else if(action === 'delete' && shouldDelete === 'Yes') {
    // Create an array of pages without the one we want to remove
    const pages = req.session.data.pages
      .filter(element => parseInt(element.pageIndex, 10) !== pageIndex)
      .map(setPageIndexToArrayPosition)

    // Save the pages
    req.session.data.pages = pages
    return res.redirect('/form-designer/clear-empty')
  } else if(action === 'delete' && shouldDelete  === 'No') {
    return res.redirect(`/form-designer/pages/${pageIndex}/edit`)
  } else {
    return res.redirect(req.path)
  }
})

// Delete user selected question
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

// Route used by the reordering buttons in your-questions.html
router.get('/form-designer/pages/:pageId/reorder/:direction', function (req, res) {
  const { pageId, direction } = req.params
  const newArrayPosition = direction === 'down' ? pageId : pageId - 2
  const { pages } = req.session.data

  const pageToMove = pages.splice(pageId - 1, 1)[0]
  pages.splice(newArrayPosition, 0, pageToMove)

  // content to display in notification banners
  var successMessage = '‘' + pageToMove['long-title'] + '’' + ' has moved ' + direction + ' to number ' + (parseInt(newArrayPosition) + 1)

  req.session.data.pages = pages.map(setPageIndexToArrayPosition)

  req.session.data.successMessage = successMessage
  res.redirect('/form-designer/clear-empty')
})


/* =====
Managing additional pages in a form
===== */

// Route used to check Declaration is complete - Check your answers (CYA)
router.post('/form-designer/pages/check-answers/edit', function (req, res) {
  const action = req.session.data.action
  req.session.data.action = undefined

  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  const errors = {};
  const complete = req.session.data.isDeclarationComplete
  const declarationContent = req.session.data.checkAnswersDeclaration

  // content to display in notification banners
  var saved = 'Your declaration has been saved'
  var savedAndComplete = 'Your declaration has been saved and marked as complete'

  // if no selection made, then throw an error
  if (!complete || !complete.length) {
    errors['isDeclarationComplete'] = {
      text: 'Select yes if you want to mark this task as complete',
      href: "#isDeclarationComplete"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if (action === 'update') {
    // set a success message for saving
    req.session.data.successMessage = saved
    return res.render('form-designer/pages/check-answers/edit', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      successMessage: saved
    })
  } else if(containsErrors) {
    return res.render('form-designer/pages/check-answers/edit', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      errors,
      errorList,
      containsErrors
    })
  } else {
    if(complete === 'yes') {
      // set a success message for saving
      req.session.data.successMessage = savedAndComplete
    } else {
      // set a success message for saving
      req.session.data.successMessage = saved
    }
    return res.redirect('../../your-form')
  }
})

// Route used to check What happens next (WHN) content has been added
router.post('/form-designer/pages/confirmation/edit', function (req, res) {
  const action = req.session.data.action
  req.session.data.action = undefined

  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  const errors = {};
  const whatHappensNext = req.session.data.confirmationNext

  // content to display in notification banners
  var saved = 'Your information about what happens next has been saved'

  // if no selection made, then throw an error
  if (!whatHappensNext || !whatHappensNext.length) {
    errors['confirmationNext'] = {
      text: 'Enter some information about what happens next',
      href: "#confirmationNext"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/pages/confirmation/edit', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      errors,
      errorList,
      containsErrors
    })
  } else if (action === 'update') {
    return res.render('form-designer/pages/confirmation/edit', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      successMessage: saved
    })
  } else {
    // set a success message for saving
    req.session.data.successMessage = saved
    return res.redirect('../../your-form')
  }
})


/* =====
Page previews
===== */

// Renders the in-page preview, set to a specific page
router.get('/form-designer/pages/:pageId/preview', function (req, res) {
  req.session.data.action = undefined
  var pageId = req.params.pageId
  var pageIndex = parseInt(pageId)
  var pageData = req.session.data.pages[pageIndex]

  res.render('form-designer/pages/preview', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
})

// This is just for convience to to the new-tab preview for this page
router.get('/form-designer/pages/:pageId/view', function (req, res) {
  return res.redirect(`/form-designer/view/${req.params.pageId}`)
})

// Routing for new-tab page previews, set to a specific page
router.post('/form-designer/preview/:pageId(\\d+)', function (req, res) {
  var cya = req.session.data.cya
  req.session.data.cya = undefined
  var pageId = req.params.pageId
  var pageIndex = parseInt(pageId)
  const isLastQuestionPage = pageIndex === (req.session.data.pages.length - 1)

  // if last question in form OR user clicked on change link from CYA, then go to CYA
  if(isLastQuestionPage || cya === 'true') {
    return res.redirect('check-answers')
  } else {
    return res.redirect(`${pageIndex + 1}`)
  }
})

// Renders the new-tab page preview, set to a specific page
router.get('/form-designer/preview/:pageId(\\d+)', function (req, res) {
  var pageId = req.params.pageId
  var pageIndex = parseInt(pageId)
  var pageData = req.session.data.pages[pageIndex]
  const isLastQuestionPage = pageIndex === (req.session.data.pages.length - 1)

  res.render('form-designer/preview/page', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    isLastQuestionPage
  })
})


/* =====
Routing for setting an email steps
===== */

// Renders the page which asks for form submissions email address, handling validation errors
router.post('/form-designer/completed-forms-email/set-completed-forms-email', function (req, res) {
  const errors = {};
  const { formsEmail} = req.session.data

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
    req.session.data.confirmationCode = undefined
    res.redirect('confirmation-code-sent')
  }
})

// Renders the page which asks to confirm wanting to change submission email address, handling validation errors
router.post('/form-designer/completed-forms-email/change-email-address', function (req, res) {
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
    res.render('form-designer/completed-forms-email/change-email-address', { errors, errorList, containsErrors })
  } else {
    if (currentFormsEmail && (currentFormsEmail != formsEmail)){
      req.session.data.confirmationCode = undefined
      res.redirect('confirmation-code-sent')
    } else {
      req.session.data.formsEmail = req.session.data.oldFormsEmail
      req.session.data.currentFormsEmail = req.session.data.formsEmail
      req.session.data.oldFormsEmail = undefined
      res.redirect('completed-forms-email')
      
    }
  }
})

// Renders the page to play back entered email and asks for email confirmation code, handling validation errors
router.post('/form-designer/completed-forms-email/completed-forms-email', function (req, res) {
  const errors = {};
  const { formsEmail, currentFormsEmail, confirmationCode } = req.session.data

  if (formsEmail.includes(formsEmail)) {
    req.session.data.oldFormsEmail = req.session.data.currentFormsEmail
    req.session.data.currentFormsEmail = formsEmail
  }

  // If the confirmation code is blank, create an error to be displayed to the user
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
    res.render('form-designer/completed-forms-email/completed-forms-email', { errors, errorList, containsErrors })
  } else {
      req.session.data.oldFormsEmail = undefined
      req.session.data.currentFormsEmail = req.session.data.formsEmail
      res.redirect('email-confirmation')
  }
})

// Renders the page which asks to cancel new email change, handling validation errors
router.post('/form-designer/completed-forms-email/cancel-new-email-change', function (req, res) {
  const errors = {};
  const { cancelNewEmail, confirmationCode } = req.session.data

  // If no selection, create an error to be displayed to the user
  if (!cancelNewEmail || !cancelNewEmail.length) {
    errors['cancelNewEmail'] = {
      text: 'Select yes if you want to cancel changing the email address',
      href: "#cancel-new-email"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/completed-forms-email/cancel-new-email-change', { errors, errorList, containsErrors })
  } else {
    if(cancelNewEmail === 'yes') {
      // set success message
      req.session.data.successMessage = 'Change of email address has been cancelled'
      req.session.data.confirmationCode = '1234'
      req.session.data.formsEmail = req.session.data.oldFormsEmail
      req.session.data.currentFormsEmail = req.session.data.formsEmail
      req.session.data.oldFormsEmail = undefined
      res.redirect('completed-forms-email')
    } else {
      req.session.data.cancelNewEmail = undefined
      res.redirect('completed-forms-email')
    }
  }
})


/* =====
Provide privacy and contact details
===== */

// Renders the page for creator to add privacy information link, handling validation errors
router.post('/form-designer/provide-link-to-privacy-information', function (req, res) {
  const errors = {};
  const { privacyInformation } = req.session.data

  // If the user haven't selected yes or no
  if (!privacyInformation?.length) {
    errors['privacyInformation'] = {
      text: 'Enter a link',
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
    // set a success message for saving
    req.session.data.successMessage = 'Your privacy information link has been saved'
    res.redirect('your-form')
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
      text: 'Enter the phone number and its opening times',
      href: "#email-support"
    }
  }
  // If the user has selected online but hasn't entered a link
  if (supportDetails?.includes('online') && !onlineSupportLink?.length) {
    errors['onlineSupportLink'] = {
      text: 'Enter a link',
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
    // set a success message for saving
    req.session.data.successMessage = 'Your contact details for support have been saved'
    res.redirect('your-form')
  }
})


/* =====
Make your form live
===== */

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
      res.redirect('your-form')
    }
  }
})


/* =====
Editing a live forms
===== */

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
      res.redirect('clear-empty')
    } else {
      res.redirect('your-form')
    }
  }
})


/* =====
Pre-filled form journeys
===== */

// Uses return data for dummy "Take your pet abroad" form
router.get('/form-designer/returning', (req, res) => {
  req.session.data = returningSessionDataDefaultsA11y
  res.redirect('/form-designer/your-forms')
})
// Uses return data for IS example "Amendment form: redundancy claim for holiday pay" form
router.get('/form-designer/returning-again', (req, res) => {
  req.session.data = returningSessionDataDefaults
  res.redirect('/form-designer/your-forms')
})


/* =====
Prototype functions
===== */

// Function to remove individual data items, for basic testing
router.get('/prototype-admin/show-data', (req, res, next) => {
  const removeKey = req.session.data.action
  req.session.data[removeKey] = undefined
  next()
})

