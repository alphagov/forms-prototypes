const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

/* ORGANISATION ADMIN VIEWS
=========================== */


// Name your group
router.post('/product-pages/org-admin/creategroup', function (req, res) {
  const errors = {};
  const { groupName } = req.session.data

  // If the user hasn’t entered a name for their group
  if (!groupName || !groupName.length) {
    errors['groupName'] = {
      text: 'Enter a name for the group',
      href: "#group-name"
    }
  }
  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if (containsErrors) {
    res.render('product-pages/org-admin/creategroup', { errors, errorList, containsErrors })
  } else {
    res.redirect('grouplanding')
  }
})

// Add an editor to this group
router.post('/product-pages/org-admin/add-groupadmin-and-editor', function (req, res) {
  const errors = {};
  const { emailToAdd } = req.session.data

  // If there are any errors with the email input we should show a specific error message
  if (!emailToAdd || !emailToAdd.length) {
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
    res.render('product-pages/org-admin/add-groupadmin-and-editor', { errors, errorList, containsErrors })
  } else {
    req.session.data.addPerson = 'Oliver'
    res.redirect('editmembers4')
  }
})





/* GROUP ADMIN VIEWS
==================== */

// Name your group
router.post('/product-pages/group-admin/creategroup', function (req, res) {
  const errors = {};
  const { groupName } = req.session.data

  // If the user hasn’t entered a name for their group
  if (!groupName || !groupName.length) {
    errors['groupName'] = {
      text: 'Enter a name for the group',
      href: "#group-name"
    }
  }

  
  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if (containsErrors) {
    res.render('product-pages/group-admin/creategroup', { errors, errorList, containsErrors })
  } else {
    res.redirect('grouplanding')
  }
})

// Add an editor to this group
router.post('/product-pages/group-admin/addauser', function (req, res) {
  const errors = {};
  const { emailToAdd } = req.session.data

  // If there are any errors with the email input we should show a specific error message
  if (!emailToAdd || !emailToAdd.length) {
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
