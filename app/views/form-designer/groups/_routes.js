const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

/* CREATING A NEW GROUP
======================= */

// What do you want to add? - new question or question set (group) 
router.post('/form-designer/groups/group-or-question', function (req, res) { 
  var groupQuestions = req.session.data.groupQuestions
  req.session.data.groupQuestions = undefined

  if (groupQuestions == 'newQuestion') {
    // add a new question
    res.redirect(`/form-designer/pages/new`)
  } else {
    // add a new question set (group)
    res.redirect(`/form-designer/groups/new`)
  }
})

// Create a new question set (group) - button journeys
router.get('/form-designer/groups/new', function (req, res) {  
  var groupId = parseInt(req.params.groupId, 10)
  var groupIndex = groupId
  var groupData = req.session.data.groups[groupIndex]

  // remove empty pageData if there is only one object (pageIndex) in array
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
  var groupIndex = groupId
  var groupData = req.session.data.groups[groupIndex]

  return res.render('form-designer/groups/edit-group', {
    groupId: groupId,
    groupIndex: groupIndex,
    groupData: groupData
  })
})
// Route used to find correct next step - answer type > settings page || edit question page
router.post('/form-designer/groups/:groupId(\\d+)/edit-group', function (req, res) {
  var groupId = parseInt(req.params.groupId, 10)
  var groupIndex = groupId
  var groupData = req.session.data.groups[groupIndex]

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

  var groupOrder = req.session.data.groupOrder
  req.session.data.groupOrder = undefined
  // if no position chosen, then throw an error
  if (!groupOrder || groupOrder == 'choose') {
    errors['groupOrder'] = {
      text: 'Choose where you want your question set to appear',
      href: "#group-order"
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
      groupId: groupId,
      groupIndex: groupIndex,
      groupData: groupData,
      errors,
      errorList,
      containsErrors
    })
  } else {
    const nextGroupId = req.session.data.groups.length

    if (!groupData) {
      req.session.data.groups.push({
        'groupIndex': nextGroupId
      })
    } else {
      groupData['groupName'] = groupName
      groupData['minLoop'] = minLoop
      groupData['maxLoop'] = maxLoop
      groupData['groupOrder'] = groupOrder
    }
    // add a new question
    res.redirect(`/form-designer/pages/new`)
  }
})


/* Journey 1
============ */ 
/*
1. “Add a question” button goes to “group-or-question.html” 
2. “Single question” radio goes to normal routes
3. “Group of questions” radio goes to “edit-group.html” 
4. “edit-group.html” goes to pages/new route (with new caption text)
5. “check your question” page needs save notification and link CTA updated to cater for taking user to “check-group.html”
6. “check-group.html” if saved should show “delete” button and list questions added to the group
*/

/* Journey 2
============ */
/*
1. add new radio question to “edit question” page
2. if “yes” radio selected route to “choose-group.html” (if no groups yet take to “edit-group.html”)
3. once saved go to “check your question” page - showing the group question associated with else only show “no” to group row
*/


module.exports = router