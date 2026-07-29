/* Add this AFTER city.js on my-city.html.
   It connects the existing Castle building to castle.html
   without changing the rest of the working city code.
*/
(() => {
  const castle = document.getElementById('castle');
  if (!castle) return;

  function openCastle(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.href = 'castle.html';
  }

  castle.addEventListener('click', openCastle, true);
  castle.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      openCastle(event);
    }
  }, true);
})();
