const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

/* CREATING A NEW GROUP
======================= */

// What do you want to add? - new question or question set (group) 
router.post('/form-designer/groups/group-or-question', function (req, res) { 
  var groupQuestions = req.session.data.groupQuestions

  if (groupQuestions == 'newGroup') {
    // add a new question set (group)
    res.redirect(`/form-designer/groups/new`)
  } else {
    // add a new question
    res.redirect(`/form-designer/pages/new`)
  }
})

// Create a new question set (group) - button journeys
router.get('/form-designer/groups/new', function (req, res) {  
  var groupId = parseInt(req.params.groupId, 10)
  var groupData = req.session.data.groups[groupId]

  // remove empty groupData if there is only one object (groupId) in array
  const groups = req.session.data.groups.filter(element => {
    if (Object.keys(element).length > 1) {
      return true
    }
    return false
  })
  // Save the groups
  req.session.data.groups = groups

  // reset highestGroupId to number of groups
  req.session.data.highestGroupId = parseInt(groups.length - 1)

  var nextGroupId = req.session.data.groups.length

  if (!groupData) {
    req.session.data.groups.push({
      'groupIndex': nextGroupId
    })
  }
  // add a new question set (group)
  res.redirect(`/form-designer/groups/${nextGroupId}/edit-group`)
})

// Edit question set (group) - display
router.get('/form-designer/groups/:groupId(\\d+)/edit-group', function (req, res) {
  var groupId = parseInt(req.params.groupId, 10)
  var groupData = req.session.data.groups[groupId]

  var link = req.session.data.link

  return res.render('form-designer/groups/edit-group', {
    link: link,
    groupData: groupData
  })
})
// Route used to find correct next step
router.post('/form-designer/groups/:groupId(\\d+)/edit-group', function (req, res) {
  var groupId = parseInt(req.params.groupId, 10)
  var groupData = req.session.data.groups[groupId]

  var action = req.session.data.action

  var errors = {};

  var groupName = req.session.data.groupName
  req.session.data.groupName = undefined
  // if no name given, then throw an error
  if (!groupName || !groupName.length) {
    errors['groupName'] = {
      text: 'Give your question set a name',
      href: "#group-name"
    }
  }

  var minLoop = req.session.data.minLoop
  req.session.data.minLoop = undefined
  // if no minimum loops given, then throw an error
  if (!minLoop || !minLoop.length) {
    errors['minLoop'] = {
      text: 'Give your question set a minimum number of repeats',
      href: "#minimum-loop"
    }
  }
  var maxLoop = req.session.data.maxLoop
  req.session.data.maxLoop = undefined
  // if no maximum loops given, then throw an error
  if (!maxLoop || !maxLoop.length) {
    errors['maxLoop'] = {
      text: 'Give your question set a maximum number of repeats',
      href: "#maximum-loop"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/groups/edit-group', {
      groupData: groupData,
      errors,
      errorList,
      containsErrors
    })
  } else {
    groupData['groupName'] = groupName
    groupData['minLoop'] = minLoop
    groupData['maxLoop'] = maxLoop

    if (action == 'saveChanges') {
      // add a new question
      res.redirect(`/form-designer/groups/${groupId}/check-group`)
    } else {
      // add a new question
      res.redirect(`/form-designer/groups/${groupId}/pages/new`)
    }
  }
})

// Check question set (group) - display
router.get('/form-designer/groups/:groupId(\\d+)/check-group', function (req, res) {
  var { groups, pages } = req.session.data
  var groupId = parseInt(req.params.groupId, 10)
  var groupData = req.session.data.groups[groupId]

  // create new tempArray - to be combined group and page lists
  const pagesOrder = []
  // try a loop over the pages
  let i = 0;
  while (i < pages.length) {
    // if “addToGroup” is not null
    if (pages[i].addToGroup != null) {
      // set group to be the group found associated to the page
      var group = groups.find(function(element) { return element.groupIndex == pages[i].addToGroup })
      // set temporary array of pages to associated with this group
      var groupPages = []
      // using this group, check if the next questions are also in the same group
      // this will start the loop where we are and should only go to the end of the pages added 
      while (i < pages.length && pages[i].addToGroup == group.groupIndex) { 
        // add page to group, if “addToGroup” is the same as the “groupIndex”
        groupPages.push(pages[i]);
        // increment loop count
        i++;
      }
      // push group into “pagesOrder” array with associated pages within it
      pagesOrder.push({ 'group': group, 'pages': groupPages })
    } else {
      // push page into “pagesOrder” array
      pagesOrder.push({ 'page': pages[i] })
      // increment loop count
      i++;
    }
  }

  // set new “pagesOrder” array in session data so we can use it elsewhere
  req.session.data.pagesOrder = pagesOrder

  return res.render('form-designer/groups/check-group', {
    pagesOrder: pagesOrder,
    groupData: groupData
  })
})
// Route used to find next step
router.post('/form-designer/groups/:groupId(\\d+)/check-group', function (req, res) {
  // return to your form page
  res.redirect(`/form-designer/clear-empty`)
})


/* Journey 1 still to do
============ */ 
/*
1a. “edit-question.html” has new caption text - show group name and question number
1b. “edit-question.html” should show group the question is part of IF associated with one
2. “check-question.html” has a way to stop adding questions, taking user to the “check-group.html” page
3. “check-group.html” if saved should show “delete” button and list questions added to the group
4. “groupOrder” should impact where in the “pagesOrder” a group appears - and should be changeable 
5. show a success message once a new group has been added on the “your-questions.html” page 
*/

/* Journey 2
============ */
/*
1. add new radio question to “edit question” page
2. if “yes” radio selected route to “choose-group.html” (if no groups yet take to “edit-group.html”)
3. once saved go to “check your question” page - showing the group question associated with else only show “no” to group row
*/


module.exports = router