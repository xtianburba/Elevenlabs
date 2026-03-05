const AUTH_FLAG = "demo_widget_authenticated";

const expectedUser = import.meta.env.VITE_LOGIN_USERNAME || "";
const expectedPassword = import.meta.env.VITE_LOGIN_PASSWORD || "";

if (sessionStorage.getItem(AUTH_FLAG) === "1") {
  window.location.replace("/landing.html");
}

const form = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorNode = document.getElementById("login-error");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorNode.textContent = "";

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!expectedUser || !expectedPassword) {
    errorNode.textContent =
      "Faltan credenciales en .env (VITE_LOGIN_USERNAME y VITE_LOGIN_PASSWORD).";
    return;
  }

  if (username === expectedUser && password === expectedPassword) {
    sessionStorage.setItem(AUTH_FLAG, "1");
    window.location.replace("/landing.html");
    return;
  }

  errorNode.textContent = "Usuario o contraseña incorrectos.";
});
