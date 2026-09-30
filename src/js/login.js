/* Login page (login.html) — sign-in form handling */

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorBox = document.getElementById("formError");
  const result = RB.login({ email, password });
  if (!result.ok) {
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    return;
  }
  window.location.href = "dashboard.html";
});
