/*
  File name: parent-account-guard.js

  Add this to parent-dashboard.html and to the page that opens Ella's world:

  <script type="module" src="parent-account-guard.js?v=2"></script>
*/

import {
  routeAuthenticatedParent
} from "./auth-router.js?v=2";

const result =
  await routeAuthenticatedParent({
    redirect: true
  });

if (
  result?.user &&
  result.destination ===
    "accept-invite.html"
) {
  // Stop the unfinished page from briefly showing before redirect.
  document.documentElement.style.visibility =
    "hidden";
}
