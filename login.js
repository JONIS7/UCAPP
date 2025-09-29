// --- login.js ---

google.accounts.id.initialize({
  client_id: '91249466385-m87mafvbgn4f12d81t9qshj3ior2phvu.apps.googleusercontent.com'
});

const loginButton = document.getElementById('loginButton');

loginButton.addEventListener('click', () => {
  const tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: '91249466385-m87mafvbgn4f12d81t9qshj3ior2phvu.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    callback: (tokenResponse) => {
      // Se o login for bem-sucedido...
      if (tokenResponse && tokenResponse.access_token) {
        // ...em vez de criar um evento, redirecionamos para a página do formulário.
        window.location.href = 'tela3.html';
      }
    },
  });
  tokenClient.requestAccessToken();
});