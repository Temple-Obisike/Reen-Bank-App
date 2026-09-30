/* Accounts page (accounts.html) — full account list, fund/withdraw/add-account modals */

const user = RB.requireAuth();
if (user) {
  function renderAccounts() {
    const accounts = RB.getAccounts(user.id);
    const list = document.getElementById("accountList");
    list.innerHTML = "";
    accounts.forEach((a) => {
      const card = document.createElement("div");
      card.className =
        "bg-[#d4f3e7] rounded-2xl card-shadow p-6 flex flex-col justify-between";
      card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-muted text-sm mb-2 text-[#46237a] font-medium">${a.name}</p>
            <p class="balance-value text-2xl font-extrabold">${RB.fmt(a.balance)}</p>
          </div>
          <button class=" eye-toggle w-9 h-9 rounded-lg border border-black/10 flex items-center justify-center hover:bg-black/5 shrink-0" aria-label="Show or hide balance">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        ${a.description ? `<p class="text-muted text-sm mb-4">${a.description}</p>` : ""}
        <div class="flex gap-3">
          <button  class="btn-primary flex-1 !h-11 !text-sm bg-[#33b786] hover:bg-[#279971] rounded-xl p-4 text-white font-medium flex justify-center items-center" data-fund="${a.id}" data-name="${a.name}">Fund</button>
          <button class=" flex-1 !h-11 !text-sm bg-gray-300 font-medium rounded-xl p-4 flex justify-center items-center" data-withdraw="${a.id}" data-name="${a.name}">Withdraw</button>
        </div>`;
      card.querySelector(".eye-toggle").addEventListener("click", (e) => {
        card.querySelector(".balance-value").classList.toggle("blur-sm");
        e.currentTarget.closest("div").classList.toggle("balance-hidden");
      });
      list.appendChild(card);
    });
    const addCard = document.createElement("button");
    addCard.id = "addAccountBtn";
    addCard.className =
      "rounded-2xl p-6 flex flex-col items-center justify-center text-brand font-bold gap-2 hover:bg-brand/5 min-h-[180px] bg-[#f0f0f0]";
    addCard.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 5v14M5 12h14"/></svg>
      Add Account`;
    addCard.addEventListener("click", () => openOverlay("addAccountOverlay"));
    list.appendChild(addCard);

    list.querySelectorAll("[data-fund]").forEach((b) =>
      b.addEventListener("click", () => {
        document.getElementById("fundAccountId").value = b.dataset.fund;
        document.getElementById("fundAccountName").textContent = b.dataset.name;
        openOverlay("fundOverlay");
      }),
    );
    list.querySelectorAll("[data-withdraw]").forEach((b) =>
      b.addEventListener("click", () => {
        document.getElementById("withdrawAccountId").value = b.dataset.withdraw;
        document.getElementById("withdrawAccountName").textContent =
          b.dataset.name;
        openOverlay("withdrawOverlay");
      }),
    );
  }
  renderAccounts();

  document
    .getElementById("addAccountBtn")
    .addEventListener("click", () => openOverlay("addAccountOverlay"));

  document.getElementById("fundForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const accId = document.getElementById("fundAccountId").value;
    const amount = document.getElementById("fundAmount").value;
    const r = RB.fundAccount(user.id, accId, amount);
    if (r.ok) {
      closeOverlay("fundOverlay");
      document.getElementById("fundForm").reset();
      document.getElementById("successMessage").textContent =
        `${RB.fmt(amount)} has been added to your Wallet!`;
      openOverlay("successOverlay");
      renderAccounts();
    }
  });

  document.getElementById("withdrawForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const accId = document.getElementById("withdrawAccountId").value;
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
    renderAccounts();
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
    renderAccounts();
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
