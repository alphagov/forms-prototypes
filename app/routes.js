const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line

module.exports = router


// Run this code when a form is submitted to '/example-2/eligibility-check-answer'
router.post('/example-2/eligibility-check-answer', function (req, res) {

  // Make a variable and give it the value from 'where-do-you-live'
  var whereDoYouLive = req.session.data['where-do-you-live']

  // Check whether the variable matches a condition
  if (whereDoYouLive == "Northern Ireland"){
    // Send user to ineligible page
    res.redirect('/example-2/ineligible')
  } else {
    // Send user to next page
    res.redirect('/example-2/question-1')
  }

})

// Renders the page editor, set to a specific page
router.get('/form-designer/edit-page/:pageId', function(req, res) {
    res.render('form-designer/edit-page', { 'pageId' : req.params.pageId });
});

// Renders the page type chooser, set to a specific page
router.get('/form-designer/choose-page-type/:pageId', function(req, res) {
    res.render('form-designer/choose-page-type', { 'pageId' : req.params.pageId });
});
