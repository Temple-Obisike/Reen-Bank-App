/* OTP page (otp.html) — demo only, no real code is sent or checked */

const digitInputs = [...document.querySelectorAll(".otp-digit")];
const errorBox = document.getElementById("formError");

// show which email it was "sent to", if we came from register.html
const params = new URLSearchParams(window.location.search);
if (params.get("email")) {
  document.getElementById("otpEmailLine").textContent =
    `Code sent to ${params.get("email")}.`;
}

// auto-move to the next box as each digit is typed
digitInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^0-9]/g, ""); // only allow numbers
    if (input.value && index < digitInputs.length - 1) {
      digitInputs[index + 1].focus();
    }
  });
});

digitInputs[0].focus();

document.getElementById("otpForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const code = digitInputs.map((input) => input.value).join("");
  errorBox.classList.add("hidden");

  if (code.length < 6) {
    errorBox.textContent = "Please fill in all 6 digits.";
    errorBox.classList.remove("hidden");
    return;
  }

  // demo mode: any 6-digit number is accepted, nothing is actually checked
  window.location.href = "dashboard.html?welcome=1";
});
