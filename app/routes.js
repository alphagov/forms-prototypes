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

// Run this code when a form is submitted to '/example-2/save-progress-check'
router.post('/example-2/save-progress-check', function (req, res) {

  // Make a variable and give it the value from 'save-progress'
  var saveProgress = req.session.data['save-progress']

  // Check whether the variable matches a condition
  if (saveProgress == "no"){
    // Send user to ineligible page
    res.redirect('/example-2/task-list')
  } else {
    // Send user to next page
    res.render('example-2/save-progress-check')
  }

})

// Renders the page editor, set to a specific page
router.get('/form-designer/edit-page/:pageId', function(req, res) {

    var action = req.session.data['action'];
    var pageId = req.params.pageId;
    var highestPageId = req.session.data['highestPageId']
    var editNextPageId = parseInt(pageId) + 1;
    var createNextPageId = parseInt(highestPageId) + 1;

    // Update the 'Highest page Id' if necessary
    // Used to loop over the page list, tweak button text etc.
    // This is a pretty fragile approach!
    if (pageId !== 'confirmation' && pageId > highestPageId) {
      req.session.data['highestPageId'] = pageId;
    }

    // If user is creating a page from the confirmation page...
    if (pageId == 'confirmation' && action == "createNextPage"){
      res.redirect('/form-designer/edit-page/' + createNextPageId);

    // If user is updating the confirmation page...
    } else if (pageId == 'confirmation' && (action == "update" || action == "")){
      res.render('form-designer/edit-confirmation-page');

    // If user is updating the start page...
    } else if (pageId == 0 && (action == "update" || action == "")){
      res.render('form-designer/edit-start-page');

    // If user pressed the 'Create next page' button...
    } else if (action == "createNextPage") {
      res.redirect('/form-designer/choose-page-type/' + createNextPageId);

    // If user pressed the 'Edit next page' button...
    } else if (action == "editNextPage") {

      // reset the action to avoid a loop
      req.session.data['action'] = "";

      res.redirect('/form-designer/edit-page/' + editNextPageId);

    // If user pressed the 'Update preview' button or back link...
    } else {
      res.render('form-designer/edit-page', {
        'pageId' : pageId
      });
    }

});


// Renders the page type chooser, set to a specific page
router.get('/form-designer/choose-page-type/:pageId', function(req, res) {
    req.session.data['action'] = "";
    res.render('form-designer/choose-page-type', { 'pageId' : req.params.pageId });
});

// Renders the in-page preview, set to a specific page
router.get('/form-designer/page-preview/:pageId', function(req, res) {
    req.session.data['action'] = "";
    res.render('form-designer/page-preview', { 'pageId' : req.params.pageId });
});

// Renders the new-tab page preview, set to a specific page
router.get('/form-designer/page-preview-new-tab/:pageId', function(req, res) {
    req.session.data['action'] = "";
    res.render('form-designer/page-preview-new-tab', { 'pageId' : req.params.pageId });
});
