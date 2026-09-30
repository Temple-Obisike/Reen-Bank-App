/* Profile page (profile.html) — personal info form, logout, mobile sidebar */

const user = RB.requireAuth();
if (user) {
  const x = RB.getAccounts(user.id);
  const mainAccountBalance = x.find((x) => x.name === "Main Account").balance;
  document.getElementById("mainAccountBalance").textContent =
    RB.fmt(mainAccountBalance);
  document
    .getElementsByClassName("eye-toggle")[0]
    .addEventListener("click", () => {
      document.getElementById("mainAccountBalance").classList.toggle("blur-sm");
    });
  document.getElementById("avatarBig").textContent = user.name
    .charAt(0)
    .toUpperCase();
  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("pName").value = user.name;
  document.getElementById("pEmail").value = user.email;
  document.getElementById("pPhone").value = user.phone || "";

  document.getElementById("infoForm").addEventListener("submit", (e) => {
    e.preventDefault();
    RB.updateProfile(user.id, {
      name: document.getElementById("pName").value.trim(),
      email: document.getElementById("pEmail").value.trim(),
      phone: document.getElementById("pPhone").value.trim(),
    });
    document.getElementById("infoSaved").classList.remove("hidden");
    document.getElementById("avatarBig").textContent = document
      .getElementById("pName")
      .value.charAt(0)
      .toUpperCase();
    document.getElementById("profileName").textContent =
      document.getElementById("pName").value;
    document.getElementById("profileEmail").textContent =
      document.getElementById("pEmail").value;
  });
}

document
  .getElementById("openLogout")
  .addEventListener("click", () => openOverlay("logoutOverlay"));
document.getElementById("confirmLogout").addEventListener("click", () => {
  RB.logout();
  window.location.href = "login.html";
});

const sidebar = document.getElementById("sidebar");
const backdrop = document.getElementById("sidebarBackdrop");
document.getElementById("menuToggle").addEventListener("click", () => {
  sidebar.classList.remove("-translate-x-full");
  backdrop.classList.remove("hidden");
});
backdrop.addEventListener("click", () => {
  sidebar.classList.add("-translate-x-full");
  backdrop.classList.add("hidden");
});
