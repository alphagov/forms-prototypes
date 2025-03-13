const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

/* CREATING A NEW QUESTION ROUTE
================================ */

// Create a new question route - button journeys
router.get('/form-designer/question-routes/route-start', function (req, res) {
  const errors = {}
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]
  var routeStartQuestion = req.session.data.routeStartQuestion

  // If the no question to start the route has been selected, create an error to be displayed to the user
  if (!routeStartQuestion?.length) {
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
    res.redirect(`conditions`)
  }
})

// Create route 1 conditions - button journeys
router.get('/form-designer/question-routes/route-conditions', function (req, res) {
  const errors = {}
  var { pages, routeStartQuestion, route1Answer, route1End } = req.session.data

  /*
    for page in req.session.data.pages 
      if page.pageIndex === routeStartQuestion 
        page.push(
          routes: {
            routeAnswer: route1Answer,
            routeEnd: route1End  
        }) 
        clear (routeStartQuestion, route1Answer, route1End)
  */
 for (let index = 0; index < pages.length; index++) {
  const element = pages[index];
    if ((parseInt(element.pageIndex, 10) + 1) == routeStartQuestion) {
      element.routing = { 'answer': route1Answer, 'skipTo': route1End }
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
    // go to question X’s routes summary screen
    res.redirect(`routes-summary`)
  }
})

module.exports = router