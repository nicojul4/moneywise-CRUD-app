window.addEventListener("DOMContentLoaded", () => {
  const loggedInUser = sessionStorage.getItem("loggedInUser");
  if (!loggedInUser) {
    window.location.href = "login.html";
    return;
  }

  // --- 1. SELEKSI ELEMEN ---
  const welcomeUsernameEl = document.getElementById("welcome-username");
  const logoutBtn = document.getElementById("logout-btn");
  const expenseForm = document.getElementById("expense-form");
  const titleInput = document.getElementById("title-input");
  const amountInput = document.getElementById("amount-input");
  const dateInput = document.getElementById("date-input");
  const expenseIdInput = document.getElementById("expense-id");
  const expenseList = document.getElementById("expense-list");
  const chartContainer = document.getElementById("chart-container");
  const totalExpensesEl = document.getElementById("total-expenses");
  const filterCategoryEl = document.getElementById("filter-category");
  const timeFiltersContainer = document.getElementById("time-filters");
  const formTitle = document.getElementById("form-title");
  const submitBtn = document.getElementById("submit-btn");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  const changePasswordForm = document.getElementById("change-password-form");
  const oldPasswordInput = document.getElementById("old-password-input");
  const newPasswordInput = document.getElementById("new-password-input");
  const confirmNewPasswordInput = document.getElementById(
    "confirm-new-password-input"
  );
  const passwordMessage = document.getElementById("password-message");
  const deleteAccountBtn = document.getElementById("delete-account-btn");

  // --- 2. STATE MANAGEMENT ---
  const usersKey = "rupiahwise_users";
  const userExpensesKey = `expenses_${loggedInUser}`;
  let expenses = JSON.parse(localStorage.getItem(userExpensesKey)) || [];
  let chart = null;
  let activeTimeFilter = "all";
  let activeCategoryFilter = "all";

  // --- Fungsi Bantuan ---
  const getUsers = () => JSON.parse(localStorage.getItem(usersKey)) || [];
  const saveUsers = (users) =>
    localStorage.setItem(usersKey, JSON.stringify(users));
  const saveExpenses = () =>
    localStorage.setItem(userExpensesKey, JSON.stringify(expenses));
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  const setDefaultDate = () =>
    (dateInput.value = new Date().toISOString().split("T")[0]);

  const getCategoryFromTitle = (title) => {
    const lowerCaseTitle = title.toLowerCase();
    const categories = {
      "Makanan & Minuman": [
        "makan",
        "minum",
        "kopi",
        "nasi",
        "gofood",
        "grabfood",
        "resto",
        "warung",
        "ayam",
        "soto",
        "bakso",
        "jajan",
        "snack",
        "gula",
        "susu",
        "roti",
      ],
      Transportasi: [
        "gojek",
        "grab",
        "maxim",
        "transport",
        "bensin",
        "parkir",
        "tol",
        "mrt",
        "lrt",
        "busway",
        "kereta",
        "ojek",
      ],
      Belanja: [
        "belanja",
        "supermarket",
        "indomaret",
        "alfamart",
        "toko",
        "mall",
        "baju",
        "celana",
        "sepatu",
        "skincare",
        "parfum",
      ],
      Tagihan: [
        "tagihan",
        "listrik",
        "pln",
        "air",
        "pdam",
        "internet",
        "pulsa",
        "paket data",
        "bpjs",
        "cicilan",
        "gas",
      ],
      Hiburan: [
        "bioskop",
        "nonton",
        "film",
        "game",
        "konser",
        "spotify",
        "netflix",
      ],
      Persembahan: ["donasi", "persembahan gereja"],
      Perkuliahan: ["uang semester", "biaya kuliah", "spp", "deposit"],
      Kesehatan: ["obat", "dokter", "apotek", "rumah sakit", "klinik"],
    };
    for (const category in categories) {
      if (
        categories[category].some((keyword) => lowerCaseTitle.includes(keyword))
      )
        return category;
    }
    return "Lainnya";
  };

  // --- 4. FUNGSI RENDER ---
  const getFilteredExpenses = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const timeCondition =
        activeTimeFilter === "all" ||
        (activeTimeFilter === "week" && expenseDate >= startOfWeek) ||
        (activeTimeFilter === "month" && expenseDate >= startOfMonth);
      const categoryCondition =
        activeCategoryFilter === "all" ||
        expense.category === activeCategoryFilter;
      return timeCondition && categoryCondition;
    });
  };
  const renderTotalExpenses = () => {
    const filtered = getFilteredExpenses();
    const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);
    totalExpensesEl.textContent = formatCurrency(total);
  };
  const renderChart = () => {
    const filtered = getFilteredExpenses();
    const categoryTotals = filtered.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    const chartLabels = Object.keys(categoryTotals);
    const chartSeries = Object.values(categoryTotals);
    if (chartLabels.length === 0) {
      chartContainer.innerHTML = `<div class="text-center text-gray-500 py-10">Tidak ada data untuk filter ini.</div>`;
      if (chart) chart.destroy();
      chart = null;
      return;
    }
    const options = {
      series: chartSeries,
      labels: chartLabels,
      chart: { type: "donut", height: 320 },
      legend: { position: "bottom" },
      tooltip: { y: { formatter: (val) => formatCurrency(val) } },
    };
    if (chart) {
      chart.updateOptions(options);
    } else {
      chartContainer.innerHTML = "";
      chart = new ApexCharts(chartContainer, options);
      chart.render();
    }
  };
  const renderExpenses = () => {
    const filtered = getFilteredExpenses();
    expenseList.innerHTML = "";
    if (filtered.length === 0) {
      expenseList.innerHTML = `<li class="p-4 text-center text-gray-400">Tidak ada pengeluaran untuk filter ini.</li>`;
      return;
    }
    filtered
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach((expense) => {
        const li = document.createElement("li");
        li.className = "expense-item item-fade-in";
        li.innerHTML = `
                <div class="flex items-center flex-grow">
                    <div class="text-sm text-center mr-4 w-12 flex-shrink-0">
                        <p class="font-bold text-gray-700">${new Date(
                          expense.date
                        ).toLocaleDateString("id-ID", { day: "2-digit" })}</p>
                        <p class="text-gray-500">${new Date(
                          expense.date
                        ).toLocaleDateString("id-ID", { month: "short" })}</p>
                    </div>
                    <div class="truncate">
                        <p class="font-bold text-gray-800 truncate">${
                          expense.title
                        }</p>
                        <p class="text-sm text-gray-500">${expense.category}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2 flex-shrink-0">
                    <p class="font-semibold text-lg text-gray-800 text-right w-28">${formatCurrency(
                      expense.amount
                    )}</p>
                    <button class="action-btn edit-btn" data-id="${
                      expense.id
                    }" title="Edit"><svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                    <button class="action-btn delete-btn" data-id="${
                      expense.id
                    }" title="Hapus"><svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
                </div>
            `;
        expenseList.appendChild(li);
      });
  };

  // PERBAIKAN: Fungsi ini sekarang lebih efisien
  const populateFilterOptions = () => {
    const allExpenses = JSON.parse(localStorage.getItem(userExpensesKey)) || [];
    const categories = [...new Set(allExpenses.map((exp) => exp.category))];
    filterCategoryEl.innerHTML = '<option value="all">Semua Kategori</option>';
    categories.sort().forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      filterCategoryEl.appendChild(option);
    });
    // Pastikan dropdown menampilkan state yang aktif
    filterCategoryEl.value = activeCategoryFilter;
  };

  const enterEditMode = (id) => {
    const expenseToEdit = expenses.find((exp) => exp.id === id);
    if (!expenseToEdit) return;
    formTitle.textContent = "Edit Pengeluaran";
    submitBtn.textContent = "Simpan Perubahan";
    cancelEditBtn.classList.remove("hidden");
    expenseIdInput.value = expenseToEdit.id;
    titleInput.value = expenseToEdit.title;
    amountInput.value = expenseToEdit.amount;
    dateInput.value = expenseToEdit.date;
    expenseForm.scrollIntoView({ behavior: "smooth" });
  };
  const exitEditMode = () => {
    formTitle.textContent = "Tambahkan Pengeluaran Baru";
    submitBtn.textContent = "Tambah";
    cancelEditBtn.classList.add("hidden");
    expenseForm.reset();
    setDefaultDate();
  };

  // --- 5. EVENT LISTENERS ---
  expenseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = +expenseIdInput.value;
    const newExpenseData = {
      title: titleInput.value,
      amount: +amountInput.value,
      date: dateInput.value,
      category: getCategoryFromTitle(titleInput.value),
    };
    if (id) {
      expenses = expenses.map((exp) =>
        exp.id === id ? { ...newExpenseData, id: exp.id } : exp
      );
    } else {
      expenses.unshift({ ...newExpenseData, id: Date.now() });
    }
    saveExpenses();
    // PERBAIKAN: Panggil renderAllAndUpdateFilters
    renderAllAndUpdateFilters();
    exitEditMode();
  });
  expenseList.addEventListener("click", (e) => {
    const targetButton = e.target.closest(".action-btn");
    if (!targetButton) return;
    const id = +targetButton.dataset.id;
    if (targetButton.classList.contains("delete-btn")) {
      const confirmation = prompt(
        'Untuk menghapus pengeluaran ini, ketik "hapus"'
      );
      if (confirmation && confirmation.toLowerCase() === "hapus") {
        expenses = expenses.filter((exp) => exp.id !== id);
        saveExpenses();
        // PERBAIKAN: Panggil renderAllAndUpdateFilters
        renderAllAndUpdateFilters();
      }
    } else if (targetButton.classList.contains("edit-btn")) {
      enterEditMode(id);
    }
  });
  timeFiltersContainer.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      activeTimeFilter = e.target.dataset.filter;
      document
        .querySelector(".time-filter-btn.active-filter")
        .classList.remove("active-filter");
      e.target.classList.add("active-filter");
      renderAll();
    }
  });
  filterCategoryEl.addEventListener("change", (e) => {
    activeCategoryFilter = e.target.value;
    renderAll();
  });
  cancelEditBtn.addEventListener("click", exitEditMode);
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  });
  changePasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    passwordMessage.textContent = "";
    passwordMessage.className = "text-sm h-4";
    const oldPassword = oldPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmNewPassword = confirmNewPasswordInput.value;
    const users = getUsers();
    const currentUserIndex = users.findIndex(
      (user) => user.username === loggedInUser
    );
    if (currentUserIndex === -1) return;
    const currentUser = users[currentUserIndex];
    if (CryptoJS.SHA256(oldPassword).toString() !== currentUser.password) {
      passwordMessage.textContent = "Password lama salah.";
      passwordMessage.classList.add("text-red-600");
      return;
    }
    if (newPassword.length < 6) {
      passwordMessage.textContent = "Password baru minimal 6 karakter.";
      passwordMessage.classList.add("text-red-600");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      passwordMessage.textContent = "Password baru tidak cocok.";
      passwordMessage.classList.add("text-red-600");
      return;
    }
    users[currentUserIndex].password = CryptoJS.SHA256(newPassword).toString();
    saveUsers(users);
    alert("Password berhasil diperbarui! Silakan login kembali.");
    sessionStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  });
  deleteAccountBtn.addEventListener("click", () => {
    const confirmation = prompt(
      `Untuk menghapus akun, ketik nama pengguna Anda: "${loggedInUser}"`
    );
    if (confirmation === loggedInUser) {
      let users = getUsers();
      localStorage.removeItem(userExpensesKey);
      users = users.filter((user) => user.username !== loggedInUser);
      saveUsers(users);
      alert("Akun Anda telah berhasil dihapus.");
      sessionStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
    } else if (confirmation !== null) {
      alert("Nama pengguna tidak cocok. Penghapusan dibatalkan.");
    }
  });

  // --- 6. INITIAL RENDER ---
  // PERBAIKAN: Memisahkan render biasa dengan render yang mengupdate filter
  const renderAll = () => {
    renderTotalExpenses();
    renderExpenses();
    renderChart();
  };

  const renderAllAndUpdateFilters = () => {
    populateFilterOptions();
    renderAll();
  };

  welcomeUsernameEl.textContent = loggedInUser;
  setDefaultDate();
  renderAllAndUpdateFilters(); // Panggil versi lengkap saat pertama kali load
});
