// remove notification banner after X seconds
function removeSuccessNotification() {
  // get the banner by class (also covers if we accidentally have more than 1 appear)
  const elems = document.querySelectorAll('.govuk-notification-banner--success');
  setTimeout(function() {
    for (const e of elems) {
      e.remove();
    }
  }, 10000); // 10 seconds
}
