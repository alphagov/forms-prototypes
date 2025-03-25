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
  var routeStartQuestion = req.session.data.routeStartQuestion
  var pageIndex = parseInt(routeStartQuestion, 10)
  var { pages } = req.session.data

  // If the no question to start the route has been selected, create an error to be displayed to the user
  if (!routeStartQuestion && routeStartQuestion !== 0) {
    errors.routeStartQuestion = {
      text: 'Select the question you want your route to start from',
      href: "#routeStartQuestion"
    }
  }

  /*
  set a temporary check variable to hold if the page exists
  var yuppityYup = false
  we first need to loop through the existing data.pages 
  for (page in data.pages) 
    check if the selected page already has a route
    if ((page.pageIndex == pageIndex) && (page.routing))
      yuppityYup = true
  */
  var yuppityYup = false 
  for (let index = 0; index < pages.length; index++) {
    const element = pages[index];
    if ((parseInt(element.pageIndex, 10)) == pageIndex) {
      if (element.routing) {
        yuppityYup = true
      }
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
    // if selected question already has a route we want to take the user to the question routes summary page
    if (yuppityYup) {
      // tkae user to question routes summary page
      res.redirect(`${pageIndex}/routes-summary`)
    } else {
      // go to add answer and skip to conditions for the route
      res.redirect(`${pageIndex}/conditions`)
    }
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
  var { pages, route1Answer, route1End, action } = req.session.data

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
    res.render('form-designer/question-routes/conditions', { errors, errorList, containsErrors, pageId, pageIndex, pageData })
  } else if (action?.length && (action === 'deleteRoute1')) {
    // reset our temporary route session data
    req.session.data.routeStartQuestion = undefined
    req.session.data.route1Answer = undefined
    req.session.data.route1End = undefined
    // reset action
    req.session.data.action = undefined
    /*
    we need to redirect the user to the are you sure you want to delete this route page, if the user selects yes on that screen we can start deleting the routes
    */
    res.redirect(`are-you-sure?action=` + action)
  } else {
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
    // reset our temporary route session data
    req.session.data.routeStartQuestion = undefined
    req.session.data.route1Answer = undefined
    req.session.data.route1End = undefined
    // reset action
    req.session.data.action = undefined
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
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId

  // get the suggested question (based on the ‘route 1’ end)
  var { pages, suggestedQuestion, action } = req.session.data

  /*
  check if delete button is pressed
  if action && action == deleteAllRoutes
    now we need to find the questions with the route 1 and route for any other answer
    and then we can delete these
  */
  if (action?.length && (action === 'deleteAllRoutes')) {
    // reset action
    req.session.data.action = undefined
    /*
    need to take the user to an are you sure page? 
    just now it will delete the routes and redirect them to ‘add and edit your questions’ page
    */
    // go to form questions list 
    res.redirect(`are-you-sure`)
  } else {
    // add the first part of routing to the suggested question 
    for (let index = 0; index < pages.length; index++) {
      const element = pages[index];
      if ((parseInt(element.pageIndex, 10)) == suggestedQuestion) {
        element.routing = { 'noAnswer': 'true' } // add a routing element to the question
      }
    }
    // reset the session data for suggestedQuestion
    req.session.data.suggestedQuestion = undefined 
    // reset action
    req.session.data.action = undefined
    // go to add a secondary route to this question
    res.redirect(`${suggestedQuestion}/question-to-skip-to`)
  }
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
    res.render('form-designer/question-routes/other-answer-route', { errors, errorList, containsErrors, routeId, routeQuestion })
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
  } else {
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
        element.routing.secondaryQuestion = routeQuestion
      }
    }
  }

  // Convert the errors into a list, so we can use it in the template 
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/question-routes/question-to-skip-to', { errors, errorList, containsErrors, pageId, routeQuestion })
  } else {
    // reset our temporary route session data
    req.session.data.routeQuestion = undefined
    req.session.data.routeEnd = undefined
    // go to back to question routes summary screen
    res.redirect(`../routes-summary`)
  }
})


/* Delete route journeys */

// Render are you sure you want to delete ‘Route 1’
router.get('/form-designer/question-routes/:pageId(\\d+)/are-you-sure', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]
  return res.render('form-designer/question-routes/are-you-sure', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
})

// Check if we should delete ‘Route 1’ - button journey
router.post('/form-designer/question-routes/:pageId(\\d+)/are-you-sure', function (req, res) {
  const errors = {}
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]
  var { deleteRoute, pages, action } = req.session.data

  // If the ‘skip the person’ to input has not been selected, create an error to be displayed to the user
  if (!deleteRoute?.length) {
    if (action?.length && (action === 'deleteRoute1')) {
      errors.deleteRoute = {
        text: 'Select ‘Yes’ if you want to delete route 1',
        href: "#deleteRoute"
      }
    } else {
      errors.deleteRoute = {
        text: 'Select ‘Yes’ to delete this question’s routes',
        href: "#deleteRoute"
      }
    }
  }

  // reset action
  req.session.data.action = undefined

  // Convert the errors into a list, so we can use it in the template 
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/question-routes/are-you-sure', { errors, errorList, containsErrors, pageId, pageIndex, pageData })
  } else if (deleteRoute?.length && (deleteRoute === 'Yes')) {
    /*
    go through all of the forms questions
    for page in data.pages
      check if question has a secondary route
      if pageData.routing.secondary 
        get the secondary route start question 
        delete ‘route 1’
      we now need to find the secondary route start question
      for page in data.pages
        if secondary route start question
          delete ‘route for any other answer’
    now we can take the user back to their list of questions 
    */
    for (let index = 0; index < pages.length; index++) {
      const element = pages[index];
      var secondaryQuestion = ''

      // get current question
      if ((parseInt(element.pageIndex, 10)) == pageIndex) {
        // check if question has a secondary route 
        if (element.routing.secondary) {
          // temporarily store the skipTo question in a variable 
          secondaryQuestion = element.routing.secondaryQuestion
        }
        // delete the routing
        element.routing = undefined
      }

      // if there is a secondary route we need to delete this too 
      if (secondaryQuestion?.length) {
        // re-loop through forms questions to find the ‘route for any other answer’ start question
        for (let secondaryIndex = 0; secondaryIndex < pages.length; secondaryIndex++) {
          const element = pages[secondaryIndex];
          // get secondaryQuestion 
          if ((parseInt(element.pageIndex, 10)) == (parseInt(secondaryQuestion, 10))) {
            // delete the routing
            element.routing = undefined
          }
        }
      }
    }
    // reset temporary page answer
    req.session.data.deleteRoute = undefined
    // go to question X’s routes summary screen
    res.redirect(`../../your-questions`)
  } else {
    // reset temporary page answer
    req.session.data.deleteRoute = undefined
    // if we are not deleting the route take the person back to the question routes summary
    res.redirect(`routes-summary`)
  }
})

// Render are you sure you want to delete ‘Route 1’
router.get('/form-designer/question-routes/:pageId(\\d+)/delete-secondary-route', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]
  return res.render('form-designer/question-routes/delete-secondary-route', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
})

// Check if we should delete ‘Route for any other answer’ - button journey
router.post('/form-designer/question-routes/:pageId(\\d+)/delete-secondary-route', function (req, res) {
  const errors = {}
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]
  var { deleteRouteOtherAnswer, pages } = req.session.data

  // If the ‘skip the person’ to input has not been selected, create an error to be displayed to the user
  if (!deleteRouteOtherAnswer?.length) {
    errors.deleteRouteOtherAnswer = {
      text: 'Select if you want to delete route for any other answer',
      href: "#deleteRouteOtherAnswer"
    }
  }

 // Convert the errors into a list, so we can use it in the template 
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/question-routes/delete-secondary-route', { errors, errorList, containsErrors, pageId, pageIndex, pageData })
  } else if (deleteRouteOtherAnswer?.length && (deleteRouteOtherAnswer === 'Yes')) {
    // reset temporary page answer
    req.session.data.deleteRouteOtherAnswer = undefined
    /*
    go through all of the forms questions
    for page in data.pages
      find this question with route
      if page.routing.baseQuestion == pageIndex
        delete ‘route for any other answer’
    now we can take the user back to their list of questions 
    */
    for (let index = 0; index < pages.length; index++) {
      const element = pages[index];
      var baseQuestion = ''

      // get current question
      if (element.routing && ((parseInt(element.routing.baseQuestion, 10)) == pageIndex)) {
        // temporarily store the baseQuestion question in a variable 
        baseQuestion = element.routing.baseQuestion
        // delete the routing
        element.routing = undefined
      }

      // now find the ‘route 1’ start question 
      for (let primaryIndex = 0; primaryIndex < pages.length; primaryIndex++) {
        const page = pages[primaryIndex];
        // get skipToQuestion 
        if (page.routing && ((parseInt(page.pageIndex, 10)) == (parseInt(baseQuestion, 10)))) {
          // delete the routing
          page.routing.secondary = undefined
          page.routing.secondaryQuestion = undefined
        }
      }
    }
    // go to question X’s routes summary screen
    res.redirect(`routes-summary`)
  } else { 
    // reset temporary page answer
    req.session.data.deleteRouteOtherAnswer = undefined
    // if we are not deleting the route take the person back to the question routes summary
    res.redirect(`routes-summary`)
  }
})

module.exports = router