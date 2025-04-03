const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

const returningSessionDataDefaults = require('../../data/returning-session-data-defaults')

/* Find out which user we are signed in as */
router.get('/product-pages/sign-in', function (req, res) {
  req.session.data = returningSessionDataDefaults
  return res.render('/product-pages/sign-in')
})
router.post('/product-pages/sign-in', function (req, res) {
  const errors = {};
  const { userType } = req.session.data

  // If the user hasn’t entered a name for their group
  if (!userType?.length) {
    errors['userType'] = {
      text: 'Choose which user type you are signing in as',
      href: "#userType"
    }
  }
  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if (containsErrors) {
    res.render('product-pages/sign-in', { errors, errorList, containsErrors })
  } else {
    res.redirect(userType + '/your-groups')
  }
})

/* View groups
=========== */
// Your groups - GET
getYourGroups = function (req, res) {
  var { groups, userType } = req.session.data
  // if we haven’t come in via the ‘sign in’ journey we should assume we are a standard user
  if (!userType?.length) { userType = 'standard' }

  // if a list of groups exist
  if (groups?.length > 0) {
    // we want to loop through each group in turn to create a link URL to use
    for (let index = 0; index < groups.length; index++) {
      // get current group
      const group = groups[index];
      // create a groupURL from the group name
      const groupURL = group['groupName'].replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
      // add the new URL to the group
      req.session.data.groups[index].groupURL = groupURL
    }
  }
  return res.render('/product-pages/' + userType + '/your-groups', {
    groups
  })
}
router.get('/product-pages/org-admin/your-groups', getYourGroups)
router.get('/product-pages/standard/your-groups', getYourGroups)

// Create a new group - POST
createNewGroup = function (req, res) {
  res.redirect('create-group')
}
router.post('/product-pages/org-admin/your-groups', createNewGroup)
router.post('/product-pages/standard/your-groups', createNewGroup)


/* Creating and editing groups
=========================== */
// Name your group - POST
saveNewGroup = function (req, res) {
  const errors = {};
  const { groupName, userType, groups, users } = req.session.data
  const groupURL = groupName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()

  // we need a way to check if a group name has already been created (to avoid duplicates)
  var groupExists = false
  for (let index = 0; index < groups.length; index++) {
    // get current group
    const group = groups[index];
    if (groupName == group.groupName) {
      groupExists = true
    }
  }

  // If the user hasn’t entered a name for their group
  if (!groupName?.length) {
    errors['groupName'] = {
      text: 'Enter a name for the group',
      href: "#group-name"
    }
  } else if (groupExists) {
    errors['groupName'] = {
      text: 'Give your new group a unique name',
      href: "#group-name"
    }
  } else {
    // else we can create a new group object and add it to our list
    if (groups?.length > 0) {
      groups.push({
        'groupId': groups.length,
        'groupName': groupName,
        'groupStatus': 'trial',
        'groupOwner': userType,
        'userAccess': [ userType ],
        'groupURL': groupURL
      })
    }
  }
  
  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if (containsErrors) {
    res.render('product-pages/' + userType + '/create-group', { errors, errorList, containsErrors })
  } else {
    res.redirect(groupURL + '/group')
  }
}
router.post('/product-pages/org-admin/create-group', saveNewGroup)
router.post('/product-pages/standard/create-group', saveNewGroup)


// Render ‘group’ page - GET
getGroup = function (req, res) {
  const { groups, userType } = req.session.data
  var groupURL = req.params.groupURL
  var groupData = ''
  // we need a way to get the group object to pass through to the group page
  for (let index = 0; index < groups.length; index++) {
    // get current group
    const group = groups[index];
    if (groupURL == group.groupURL) {
      groupData = groups[index]
    }
  }
  
  return res.render('/product-pages/' + userType + '/group', {
    groupData
  })
}
router.get('/product-pages/org-admin/:groupURL/group', getGroup)
router.get('/product-pages/standard/:groupURL/group', getGroup)


// Add an editor to this group
router.post('/product-pages/org-admin/add-groupadmin-and-editor', function (req, res) {
  const errors = {};
  const { emailToAdd } = req.session.data


  // If there are any errors with the email input we should show a specific error message
  if (!emailToAdd?.length) {
    errors['emailToAdd'] = {
      // if the email has been left blank
      text: 'Enter an email address',
      href: "#group-name"
    }
  } else if (!emailToAdd.includes('gov.uk') || !emailToAdd.includes('@')) {
    // if the email doesn’t include gov.uk in it, or isn’t an email format (doesn’t include an ‘@’ symbol)
    errors['emailToAdd'] = {
      text: 'Enter an email address in the correct format, like name@example.gov.uk',
      href: "#group-name"
    }
  } else if (!emailToAdd.includes('@digital.cabinet-office.gov.uk')) {
    // if the email isn’t a digital.cabinet-office.gov.uk email
    errors['emailToAdd'] = {
      text: 'Enter an email address from your organisation',
      href: "#group-name"
    }
  } else if (!emailToAdd.includes('oliver@digital.cabinet-office.gov.uk')) {
    // if the email doesn’t have a Forms account, this example specifically looks for “oliver@digital.cabinet-office.gov.uk”
    errors['emailToAdd'] = {
      text: 'This person does not have a GOV.UK Forms account',
      href: "#group-name"
    }
  }
  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if (containsErrors) {
    res.render('product-pages/org-admin/add-groupadmin-and-editor', { errors, errorList, containsErrors })
  } else {
    req.session.data.addPerson = 'Oliver'
    res.redirect('editmembers4')
  }
})

// Add an editor to this group
router.post('/product-pages/standard/addauser', function (req, res) {
  const errors = {};
  const { emailToAdd } = req.session.data

  // If there are any errors with the email input we should show a specific error message
  if (!emailToAdd?.length) {
    errors['emailToAdd'] = {
      // if the email has been left blank
      text: 'Enter an email address',
      href: "#group-name"
    }
  } else if (!emailToAdd.includes('gov.uk') || !emailToAdd.includes('@')) {
    // if the email doesn’t include gov.uk in it, or isn’t an email format (doesn’t include an ‘@’ symbol)
    errors['emailToAdd'] = {
      text: 'Enter an email address in the correct format, like name@example.gov.uk',
      href: "#group-name"
    }
  } else if (!emailToAdd.includes('@cabinet-office.gov.uk')) {
    // if the email isn’t a cabinet-office.gov.uk email
    errors['emailToAdd'] = {
      text: 'Enter an email address from your organisation',
      href: "#group-name"
    }
  } else if (!emailToAdd.includes('oliver@cabinet-office.gov.uk')) {
    // if the email doesn’t have a Forms account, this example specifically looks for “oliver@cabinet-office.gov.uk”
    errors['emailToAdd'] = {
      text: 'This person does not have a GOV.UK Forms account',
      href: "#group-name"
    }
  }
  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if (containsErrors) {
    res.render('product-pages/group-admin/addauser', { errors, errorList, containsErrors })
  } else {
    res.redirect('editmembers3')
  }
})

module.exports = router
