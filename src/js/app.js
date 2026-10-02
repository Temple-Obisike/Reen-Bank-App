/* ==========================================================================
   Reen Bank — shared application logic
   Everything runs client-side against localStorage so the whole prototype
   is fully functional offline, with no backend required:
     - register / login / logout (fake auth, not secure — demo only)
     - accounts (add, fund, withdraw)
     - transactions (auto-generated on fund/withdraw)
     - profile edit
   ========================================================================== */

// automatically highlight whichever sidebar link matches the current page
document.querySelectorAll(".side-link").forEach((link) => {
  const linkPage = link.getAttribute("href");
  const currentPage = window.location.pathname.split("/").pop();

  if (linkPage === currentPage) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});

const RB = (() => {
  const DB_KEY = "reenbank_db_v1";
  const SESSION_KEY = "reenbank_session_v1";

  const fmt = (n) =>
    "₦ " +
    Number(n || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const uid = () => Math.random().toString(36).slice(2, 10);

  function seedDb() {
    return {
      users: [],
      accounts: [],
      transactions: [],
    };
  }

  function loadDb() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      return raw ? JSON.parse(raw) : seedDb();
    } catch (e) {
      return seedDb();
    }
  }

  function saveDb(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function setSession(userId) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function currentUser() {
    const s = getSession();
    if (!s) return null;
    const db = loadDb();
    return db.users.find((u) => u.id === s.userId) || null;
  }

  function seedAccountsForUser(db, userId) {
    const starter = [
      { id: uid(), userId, name: "Main Account", balance: 0 },
      { id: uid(), userId, name: "School Savings", balance: 0 },
      { id: uid(), userId, name: "Holiday Plan", balance: 0 },
    ];
    db.accounts.push(...starter);
    // starter.forEach((a, i) => {
    //   db.transactions.push({
    //     id: uid(),
    //     userId,
    //     accountId: a.id,
    //     type: "credit",
    //     label: "Opening balance",
    //     amount: a.balance,
    //     date: new Date(
    //       Date.now() - (starter.length - i) * 86400000,
    //     ).toISOString(),
    //   });
    // });
  }

  function register({ name, email, password }) {
    const db = loadDb();
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "An account with that email already exists." };
    }
    const user = { id: uid(), name, email, password };
    db.users.push(user);
    seedAccountsForUser(db, user.id);
    saveDb(db);
    setSession(user.id);
    return { ok: true, user };
  }

  function login({ email, password }) {
    const db = loadDb();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user || user.password !== password) {
      return { ok: false, error: "Incorrect email or password." };
    }
    setSession(user.id);
    return { ok: true, user };
  }

  function logout() {
    clearSession();
  }

  function requireAuth() {
    const user = currentUser();
    if (!user) {
      window.location.href = "login.html";
      return null;
    }
    return user;
  }

  function resetPassword({ email, password }) {
    const db = loadDb();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user) return { ok: false, error: "No account found with that email." };
    user.password = password;
    saveDb(db);
    return { ok: true };
  }

  function getAccounts(userId) {
    const db = loadDb();
    return db.accounts.filter((a) => a.userId === userId);
  }

  function getTransactions(userId, accountId) {
    const db = loadDb();
    return db.transactions
      .filter(
        (t) => t.userId === userId && (!accountId || t.accountId === accountId),
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function addAccount(userId, name, description) {
    const db = loadDb();
    const acc = {
      id: uid(),
      userId,
      name,
      description: description || "",
      balance: 0,
    };
    db.accounts.push(acc);
    saveDb(db);
    return acc;
  }

  function fundAccount(userId, accountId, amount) {
    const db = loadDb();
    const acc = db.accounts.find(
      (a) => a.id === accountId && a.userId === userId,
    );
    if (!acc) return { ok: false, error: "Account not found." };
    acc.balance += Number(amount);
    db.transactions.push({
      id: uid(),
      userId,
      accountId,
      type: "credit",
      label: "Wallet top-up",
      amount: Number(amount),
      date: new Date().toISOString(),
    });
    saveDb(db);
    return { ok: true, account: acc };
  }

  function withdrawFromAccount(userId, accountId, amount) {
    const db = loadDb();
    const acc = db.accounts.find(
      (a) => a.id === accountId && a.userId === userId,
    );
    if (!acc) return { ok: false, error: "Account not found." };
    if (acc.balance < Number(amount))
      return { ok: false, error: "Insufficient balance." };
    acc.balance -= Number(amount);
    db.transactions.push({
      id: uid(),
      userId,
      accountId,
      type: "debit",
      label: "Withdrawal to bank account",
      amount: Number(amount),
      date: new Date().toISOString(),
    });
    saveDb(db);
    return { ok: true, account: acc };
  }

  function updateProfile(userId, patch) {
    const db = loadDb();
    const user = db.users.find((u) => u.id === userId);
    if (!user) return { ok: false };
    Object.assign(user, patch);
    saveDb(db);
    return { ok: true, user };
  }

  return {
    fmt,
    uid,
    register,
    login,
    logout,
    requireAuth,
    currentUser,
    resetPassword,
    getAccounts,
    getTransactions,
    addAccount,
    fundAccount,
    withdrawFromAccount,
    updateProfile,
  };
})();

/* ---------------- generic UI helpers used across pages ------------------ */

function openOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("open");
  document.body.style.overflow = "hidden";
  const focusable = el.querySelector("input,button,select,textarea");
  if (focusable) focusable.focus();
}

function closeOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("open");
  document.body.style.overflow = "";
}

// close overlay on backdrop click or Escape
document.addEventListener("click", (e) => {
  if (e.target.classList && e.target.classList.contains("overlay")) {
    e.target.classList.remove("open");
    document.body.style.overflow = "";
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".overlay.open").forEach((o) => {
      o.classList.remove("open");
    });
    document.body.style.overflow = "";
  }
});

// mobile nav toggle (landing page + app shell)
function initMobileNav(buttonId, panelId) {
  const btn = document.getElementById(buttonId);
  const panel = document.getElementById(panelId);
  if (!btn || !panel) return;
  btn.addEventListener("click", () => {
    panel.classList.toggle("hidden");
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
  });
}

// simple FAQ accordion
function initAccordion(containerSelector) {
  document.querySelectorAll(containerSelector).forEach((container) => {
    container.querySelectorAll("[data-faq-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const panel = trigger
          .closest("[data-faq-item]")
          .querySelector("[data-faq-panel]");
        const isOpen = trigger.getAttribute("aria-expanded") === "true";
        container.querySelectorAll("[data-faq-trigger]").forEach((t) => {
          t.setAttribute("aria-expanded", "false");
          t
            .closest("[data-faq-item]")
            .querySelector("[data-faq-panel]").style.maxHeight = null;
          t.closest("[data-faq-item]").classList.remove("faq-active");
        });
        if (!isOpen) {
          trigger.setAttribute("aria-expanded", "true");
          panel.style.maxHeight = panel.scrollHeight + "px";
          trigger.closest("[data-faq-item]").classList.add("faq-active");
        }
      });
    });
  });
}
