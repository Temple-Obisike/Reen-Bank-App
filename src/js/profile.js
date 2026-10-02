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

// "show all transactions" = call RB.getTransactions with only userId,
// no accountId, so it isn't filtered down to one account
const allTransactions = RB.getTransactions(user.id);
const txListEl = document.getElementById("txList");
const txEmptyEl = document.getElementById("txEmpty");

if (allTransactions.length === 0) {
  txEmptyEl.classList.remove("hidden");
} else {
  txEmptyEl.classList.add("hidden");
  txListEl.innerHTML = allTransactions
    .map((t) => {
      const isCredit = t.type === "credit";
      const sign = isCredit ? "+" : "-";
      const color = isCredit ? "text-[#33b786]" : "text-red-500";
      const dateStr =
        new Date(t.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        " – " +
        new Date(t.date).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });

      return `
        <div class="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-3">
          <span class="font-medium text-sm">${t.label}</span>
          <span class="text-muted text-xs">${dateStr}</span>
          <span class="font-bold text-sm ${color}">${sign} ${RB.fmt(t.amount)}</span>
        </div>`;
    })
    .join("");
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
