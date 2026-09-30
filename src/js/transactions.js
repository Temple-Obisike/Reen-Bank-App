/* Transactions page (transactions.html) — per-account tabs + transaction history */

const user = RB.requireAuth();
if (user) {
  const accounts = RB.getAccounts(user.id);
  let activeAccountId = accounts[0] ? accounts[0].id : null;

  function renderTabs() {
    const wrap = document.getElementById("accountTabs");
    wrap.innerHTML = "";
    accounts.forEach((a) => {
      const btn = document.createElement("button");
      btn.className =
        "flex justify-center items-center   p-8 h-11 rounded-xl font-bold text-sm border " +
        (a.id === activeAccountId
          ? "bg-[#D4F3E7] text-green-500 border-[#D4F3E7] border-l-6 border-l-[#46237a]"
          : "bg-white text-[#252525] border-black/10 hover:bg-black/5");
      btn.textContent = a.name;
      btn.addEventListener("click", () => {
        activeAccountId = a.id;
        renderTabs();
        renderAccountView();
      });
      wrap.appendChild(btn);
    });
  }

  function renderAccountView() {
    const acc = accounts.find((a) => a.id === activeAccountId);
    if (!acc) return;
    document.getElementById("tabAccountName").textContent = acc.name;
    document.getElementById("tabAccountBalance").textContent = RB.fmt(
      acc.balance,
    );

    const txs = RB.getTransactions(user.id, acc.id);
    const list = document.getElementById("txList");
    const empty = document.getElementById("txEmpty");
    list.innerHTML = "";
    if (txs.length === 0) {
      empty.classList.remove("hidden");
    } else {
      empty.classList.add("hidden");
      txs.forEach((t) => {
        const row = document.createElement("div");
        row.className =
          "grid sm:grid-cols-[1fr_auto_auto] gap-2 sm:gap-4 px-6 py-4 items-center";
        const dateStr = new Date(t.date).toLocaleDateString("en-NG", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const sign = t.type === "credit" ? "+" : "−";
        const color = t.type === "credit" ? "text-brand" : "text-red-500";
        row.innerHTML = `
          <span class="font-medium">${t.label}</span>
          <span class="text-muted text-sm">${dateStr}</span>
          <span class="font-bold text-right ${color}">${sign} ${RB.fmt(t.amount)}</span>`;
        list.appendChild(row);
      });
    }
  }

  if (accounts.length) {
    renderTabs();
    renderAccountView();
  } else {
    document.getElementById("tabAccountName").textContent = "No accounts yet";
  }

  document.getElementById("eyeToggle").addEventListener("click", () => {
    document
      .querySelectorAll(".balance-value")
      .forEach((el) => el.classList.toggle("blur-sm"));
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
