/* Register page (register.html) — sign-up form handling */

// pre-fill email if it arrived from the landing page footer form
const params = new URLSearchParams(window.location.search);
if (params.get("email"))
  document.getElementById("email").value = params.get("email");

document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const terms = document.getElementById("terms").checked;
  const errorBox = document.getElementById("formError");

  if (!terms) {
    errorBox.textContent =
      "Please agree to the Terms, Privacy Policy and Fees to continue.";
    errorBox.classList.remove("hidden");
    return;
  }
  if (password.length < 6) {
    errorBox.textContent = "Password must be at least 6 characters.";
    errorBox.classList.remove("hidden");
    return;
  }
  const result = RB.register({ name, email, password });
  if (!result.ok) {
    errorBox.textContent = result.error;
    errorBox.classList.remove("hidden");
    return;
  }
  window.location.href = "otp.html?email=" + encodeURIComponent(email);
});
