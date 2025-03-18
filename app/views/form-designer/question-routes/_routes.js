const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

/* CREATING A NEW QUESTION ROUTE
================================ */

/* Route 1 */

// Render question route start
getStartQuestion = function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]
  return res.render('form-designer/question-routes/new-condition', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
}
router.get('/form-designer/question-routes/new-condition', getStartQuestion)
router.get('/form-designer/question-routes/:pageId(\\d+)/new-condition', getStartQuestion)

// Create a new question route - button journey
// this POST also creates our ‘pageId’ to use throughout the editing and creating of routes attached to it
postStartQuestion = function (req, res) {
  const errors = {}  
  var pageId = parseInt(req.params.pageId, 10)
  var routeStartQuestion = parseInt(req.session.data.routeStartQuestion, 10)
  var pageIndex = routeStartQuestion

  if (pageId) {
    pageIndex = pageId
  }

  // If the no question to start the route has been selected, create an error to be displayed to the user
  if (!routeStartQuestion) {
    errors.routeStartQuestion = {
      text: 'Select the question you want your route to start from',
      href: "#route-start-question"
    }
  }

  // Convert the errors into a list, so we can use it in the template 
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/question-routes/new-condition', { errors, errorList, containsErrors })
  } else {
    // go to add conditions to the route
    res.redirect(`${pageIndex}/conditions`)
  }
}
router.post('/form-designer/question-routes/route-start', postStartQuestion)
router.post('/form-designer/question-routes/:pageId(\\d+)/route-start', postStartQuestion)

// Render ‘Route 1’ answer and skip to conditions
router.get('/form-designer/question-routes/:pageId(\\d+)/conditions', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]
  return res.render('form-designer/question-routes/conditions', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
})

// Create ‘Route 1’ - button journey
postConditions = function (req, res) {
  const errors = {}
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]
  var { pages, route1Answer, route1End } = req.session.data

  /*
  we need to loop through our forms questions
  for page in req.session.data.pages 
    find if the routeStart is the same as the current page loop
    if page.pageIndex === routeStartQuestion 
      now we need to check if routing already exists on our base question 
      if page.routing 
        we just want to update the existing keys
        routing.answer = route1Answer
        routing.skipTo = route1End
      else 
        we need to create a new key object for routing
        page.push(
          routing: {
            routeAnswer: route1Answer,
            routeEnd: route1End  
        }) 
      clear (routeStartQuestion, route1Answer, route1End)
  */
  for (let index = 0; index < pages.length; index++) {
    const element = pages[index];
    if ((parseInt(element.pageIndex, 10)) == pageIndex) {
      if (element.routing) {
        element.routing.answer = route1Answer
        element.routing.skipTo = route1End 
      } else {
        element.routing = { 'answer': route1Answer, 'skipTo': route1End }
      }
    }
  }

  // If the ‘is answered as’ input has not been selected, create an error to be displayed to the user
  if (!route1Answer?.length) {
    errors.route1Answer = {
      text: 'Select the answer to base this route on',
      href: "#route-1-answer"
    }
  }
  // If the ‘skip the person’ to input has not been selected, create an error to be displayed to the user
  if (!route1End?.length) {
    errors.route1End = {
      text: 'Select the question or page to skip to',
      href: "#route-1-end"
    }
  }

  // Convert the errors into a list, so we can use it in the template 
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/question-routes/conditions', { errors, errorList, containsErrors })
  } else {
    // reset our temporary route session data
    req.session.data.routeStartQuestion = undefined
    req.session.data.route1Answer = undefined
    req.session.data.route1End = undefined
    // go to question X’s routes summary screen
    res.redirect(`routes-summary`)
  }
}
router.post('/form-designer/question-routes/route-conditions', postConditions)
router.post('/form-designer/question-routes/:pageId(\\d+)/route-conditions', postConditions)


/* Questions routes summary screen */ 

// Render questions routes summary page
router.get('/form-designer/question-routes/:pageId(\\d+)/routes-summary', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]
  return res.render('form-designer/question-routes/routes-summary', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
})

// Start a ‘Route for any other answer’ - suggested question - button journey
router.post('/form-designer/question-routes/:pageId(\\d+)/questions-routes', function (req, res) {
  // if button pressed
  // get the suggested question (based on the route 1 end)
  var { pages, suggestedQuestion } = req.session.data
  req.session.data.suggestedQuestion = undefined // reset the session data for suggestedQuestion
  // add the first part of routing to the suggested question 
  for (let index = 0; index < pages.length; index++) {
    const element = pages[index];
    if ((parseInt(element.pageIndex, 10)) == suggestedQuestion) {
      element.routing = { 'noAnswer': 'true' } // add a routing element to the question
    }
  }
  // go to add a secondary route to this question
  res.redirect(`${suggestedQuestion}/question-to-skip-to`)
})


/* For any other answer route */

// Render ‘Route for any other answer’ start question
getRouteOtherAnswer = function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]
  var routeId = parseInt(req.params.routeQuestion, 10)
  var routeData = req.session.data.pages[routeId]
  return res.render('form-designer/question-routes/other-answer-route', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    routeId: routeId,
    routeData: routeData
  })
}
router.get('/form-designer/question-routes/:pageId(\\d+)/other-answer-route', getRouteOtherAnswer)
router.get('/form-designer/question-routes/:pageId(\\d+)/:routeQuestion(\\d+)/other-answer-route', getRouteOtherAnswer)

// Start a ‘Route for any other answer’ - custom question - button journey
postRouteOtherAnswerStart = function (req, res) {
  const errors = {}  
  var routeId = parseInt(req.params.routeQuestion, 10)
  var routeQuestion = parseInt(req.session.data.routeQuestion, 10)
  var { pages } = req.session.data

  /*
  we need to check if the routeId (original route question) is the same as the newly chosen one
  if routeId !== routeQuestion 
    we then need to find the routeId page from the form
    for page in req.session.data.pages 
      if page.pageIndex == routeId 
        finally we can ‘delete’ the routing key object
        delete page.routing
  */
  if (routeId !== routeQuestion) {
    for (let index = 0; index < pages.length; index++) {
      const element = pages[index];
      // add routing value with end point to the relevant question 
      if ((parseInt(element.pageIndex, 10)) == routeId) {
        delete element.routing
      }
    }
  }

  // If the no question to start the route has been selected, create an error to be displayed to the user
  if (!routeQuestion) {
    errors.routeQuestion = {
      text: 'Select the question you want to add your route from',
      href: "#routeQuestion"
    }
  }

  // Convert the errors into a list, so we can use it in the template 
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/question-routes/other-answer-route', { errors, errorList, containsErrors })
  } else {
    if(!routeId) {
      // go to add conditions to the route
      res.redirect(`${routeQuestion}/question-to-skip-to`)
    } else {
      // if we are editing an existing ‘route for any other answer’ we need to update the routeQuestion
      res.redirect(`../${routeQuestion}/question-to-skip-to`)
    }
  }
}
router.post('/form-designer/question-routes/:pageId(\\d+)/other-answer-route-start', postRouteOtherAnswerStart)
router.post('/form-designer/question-routes/:pageId(\\d+)/:routeQuestion(\\d+)/other-answer-route-start', postRouteOtherAnswerStart)

// Render ‘Route for any other answer’ end page question
router.get('/form-designer/question-routes/:pageId(\\d+)/:routeQuestion(\\d+)/question-to-skip-to', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]
  var routeQuestion = parseInt(req.params.routeQuestion, 10)
  var routeIndex = routeQuestion
  return res.render('form-designer/question-routes/question-to-skip-to', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    routeIndex: routeIndex
  })
})

// Finish creating ‘Route for any other answer’ - button journey
router.post('/form-designer/question-routes/:pageId(\\d+)/:routeQuestion(\\d+)/secondary-skip-end', function (req, res) {
  const errors = {}
  var { routeEnd, pages } = req.session.data
  var routeQuestion = parseInt(req.params.routeQuestion, 10)
  var pageId = parseInt(req.params.pageId, 10)

  // If the no question to start the route has been selected, create an error to be displayed to the user
  if (!routeEnd?.length) {
    errors.routeEnd = {
      text: 'Select the question you want to skip the person to',
      href: "#routeEnd"
    }
  }

  /*
  now add the routing to the correct question
  for page in req.session.data.pages
    if page.pageIndex == routeQuestion
      page.routing = { 'skipTo': routeEnd }

  clear routeQuestion and routeEnd just before we redirect
  */
  for (let index = 0; index < pages.length; index++) {
    const element = pages[index];
    // add routing value with end point to the relevant question 
    if ((parseInt(element.pageIndex, 10)) == routeQuestion) {
      element.routing = { 'baseQuestion': pageId, 'noAnswer': true, 'thenSkipTo': routeEnd  }
    }
    // we also need to add a value to the routing value of the original question
    if ((parseInt(element.pageIndex, 10)) == pageId) {
      element.routing.secondary = 'true'
      element.routing.secondaryQuestion = element.pageIndex
    }
  }

  // Convert the errors into a list, so we can use it in the template 
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/question-routes/question-to-skip-to', { errors, errorList, containsErrors })
  } else {
    // reset our temporary route session data
    req.session.data.routeQuestion = undefined
    req.session.data.routeEnd = undefined
    // go to back to question routes summary screen
    res.redirect(`../routes-summary`)
  }
})

module.exports = router