/* Reset-password page (reset-password.html) — email step -> new password step -> confirmation
   (OTP verification step intentionally omitted, per instructions) */

let resetEmail = "";

document.getElementById("emailForm").addEventListener("submit", (e) => {
  e.preventDefault();
  resetEmail = document.getElementById("resetEmail").value.trim();
  const errorBox = document.getElementById("emailError");
  const db = JSON.parse(localStorage.getItem("reenbank_db_v1") || '{"users":[]}');
  const exists = db.users.some((u) => u.email.toLowerCase() === resetEmail.toLowerCase());
  if (!exists) {
    errorBox.textContent = "No account found with that email.";
    errorBox.classList.remove("hidden");
    return;
  }
  document.getElementById("stepEmail").classList.add("hidden");
  document.getElementById("stepNewPassword").classList.remove("hidden");
});

document.getElementById("newPwForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const pw = document.getElementById("newPw").value;
  const retype = document.getElementById("retypePw").value;
  const errorBox = document.getElementById("pwError");
  if (pw.length < 6) {
    errorBox.textContent = "Password must be at least 6 characters.";
    errorBox.classList.remove("hidden");
    return;
  }
  if (pw !== retype) {
    errorBox.textContent = "Passwords do not match.";
    errorBox.classList.remove("hidden");
    return;
  }
  RB.resetPassword({ email: resetEmail, password: pw });
  document.getElementById("stepNewPassword").classList.add("hidden");
  document.getElementById("stepDone").classList.remove("hidden");
});
