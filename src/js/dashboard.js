/* Dashboard page (dashboard.html) — balance overview, accounts grid,
   fund/withdraw/add-account modals, notifications, logout, mobile sidebar */

const user = RB.requireAuth();
if (user) {
  // .addEventListener("click", () => {
  //   document.getElementById("mainAccountBalance").classList.toggle("blur-sm");
  // });
  document.getElementById("avatarInitial").textContent = user.name
    .charAt(0)
    .toUpperCase();
  document.getElementById("topbarName").textContent = user.name;

  if (new URLSearchParams(location.search).get("welcome")) {
    document.getElementById("welcomeBanner").classList.remove("hidden");
  }

  function renderAll() {
    const accounts = RB.getAccounts(user.id);
    const txs = RB.getTransactions(user.id);
    const total = accounts.reduce((s, a) => s + a.balance, 0);
    const income = txs
      .filter((t) => t.type === "credit")
      .reduce((s, t) => s + t.amount, 0);
    const expense = txs
      .filter((t) => t.type === "debit")
      .reduce((s, t) => s + t.amount, 0);
    document.getElementById("totalBalance").textContent = RB.fmt(total);
    document.getElementById("incomeTotal").textContent = RB.fmt(income);
    document.getElementById("expenseTotal").textContent = RB.fmt(expense);

    const grid = document.getElementById("accountGrid");
    grid.innerHTML = "";
    accounts.forEach((a) => {
      const card = document.createElement("div");
      card.className = " bg-[#D4F3E7] rounded-2xl card-shadow p-6";
      card.innerHTML = `
        <p class="text-muted text-sm mb-2 font-bold text-[#46237a]">${a.name}</p>
        <p class="balance-value text-2xl font-extrabold mb-5">${RB.fmt(a.balance)}</p>
        `;
      grid.appendChild(card);
    });
    // const addCard = document.createElement("button");
    // addCard.className = "border-2 border-dashed border-brand/40 rounded-2xl p-6 flex flex-col items-center justify-center text-brand font-bold gap-2 hover:bg-brand/5";
    // addCard.innerHTML = `
    //   <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 5v14M5 12h14"/></svg>
    //   Add Account`;
    // addCard.addEventListener("click", () => openOverlay("addAccountOverlay"));
    // grid.appendChild(addCard);

    // populate select dropdowns
    const opts = accounts
      .map(
        (a) =>
          `<option value="${a.id}">${a.name} — ${RB.fmt(a.balance)}</option>`,
      )
      .join("");
    document.getElementById("fundAccountSelect").innerHTML = opts;
    document.getElementById("withdrawAccountSelect").innerHTML = opts;

    grid.querySelectorAll("[data-fund]").forEach((b) =>
      b.addEventListener("click", () => {
        document.getElementById("fundAccountSelect").value = b.dataset.fund;
        openOverlay("fundOverlay");
      }),
    );
    grid.querySelectorAll("[data-withdraw]").forEach((b) =>
      b.addEventListener("click", () => {
        document.getElementById("withdrawAccountSelect").value =
          b.dataset.withdraw;
        openOverlay("withdrawOverlay");
      }),
    );
  }
  renderAll();

  document.getElementById("fundForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const accId = document.getElementById("fundAccountSelect").value;
    const amount = document.getElementById("fundAmount").value;
    const r = RB.fundAccount(user.id, accId, amount);
    if (r.ok) {
      closeOverlay("fundOverlay");
      document.getElementById("fundForm").reset();
      document.getElementById("successMessage").textContent =
        `${RB.fmt(amount)} has been added to your Wallet!`;
      openOverlay("successOverlay");
      renderAll();
    }
  });

  document.getElementById("withdrawForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const accId = document.getElementById("withdrawAccountSelect").value;
    const amount = document.getElementById("withdrawAmount").value;
    const r = RB.withdrawFromAccount(user.id, accId, amount);
    const errBox = document.getElementById("withdrawError");
    if (!r.ok) {
      errBox.textContent = r.error;
      errBox.classList.remove("hidden");
      return;
    }
    errBox.classList.add("hidden");
    closeOverlay("withdrawOverlay");
    document.getElementById("withdrawForm").reset();
    document.getElementById("successMessage").textContent =
      `${RB.fmt(amount)} has been sent to your Bank Account!`;
    openOverlay("successOverlay");
    renderAll();
  });

  document.getElementById("addAccountForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("newAccName").value.trim();
    const desc = document.getElementById("newAccDesc").value.trim();
    RB.addAccount(user.id, name, desc);
    closeOverlay("addAccountOverlay");
    document.getElementById("addAccountForm").reset();
    document.getElementById("successMessage").textContent =
      `Account "${name}" has been created successfully!`;
    openOverlay("successOverlay");
    renderAll();
  });
  document.getElementById("toggleBalance").addEventListener("click", () => {
    document.querySelectorAll("#accountGrid .balance-value").forEach((el) => {
      el.classList.toggle("blur-sm");
    });
  });
  document.getElementById("toggleBalance").addEventListener("click", () => {
    document.querySelectorAll("#balanceCard .balance-value").forEach((el) => {
      el.classList.toggle("blur-sm");
    });
  });
}

// logout
document
  .getElementById("openLogout")
  .addEventListener("click", () => openOverlay("logoutOverlay"));
document.getElementById("confirmLogout").addEventListener("click", () => {
  RB.logout();
  window.location.href = "login.html";
});

// balance show/hide
const balanceWrap = document.getElementById("balanceWrap");
document.getElementById("toggleBalance").addEventListener("click", () => {
  balanceWrap.classList.toggle("balance-visible");
  balanceWrap.classList.toggle("balance-hidden");
});

// dropdown menus
function bindDropdown(btnId, menuId) {
  const btn = document.getElementById(btnId);
  const menu = document.getElementById(menuId);
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("hidden");
  });
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== btn)
      menu.classList.add("hidden");
  });
}
bindDropdown("dateBtn", "dateMenu");
bindDropdown("notifBtn", "notifMenu");
document.querySelectorAll(".date-opt").forEach((opt) =>
  opt.addEventListener("click", () => {
    document.getElementById("dateLabel").textContent = opt.textContent;
    document.getElementById("dateMenu").classList.add("hidden");
  }),
);

// mobile sidebar
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
