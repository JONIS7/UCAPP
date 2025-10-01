// --- login.js SIMPLIFICADO ---

// O Google vai chamar esta função automaticamente depois do login.
function handleCredentialResponse(response) {
  console.log("Login com a Conta Google bem-sucedido!");

  // Se o login foi bem-sucedido, redireciona diretamente para a página principal.
  window.location.href = 'tela3.html';
}