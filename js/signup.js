window.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const usernameInput = document.getElementById("username-input");
  const passwordInput = document.getElementById("password-input");
  const confirmPasswordInput = document.getElementById(
    "confirm-password-input"
  );
  const errorMessage = document.getElementById("error-message");

  const getUsers = () => {
    const usersJSON = localStorage.getItem("moneywise_users");
    return usersJSON ? JSON.parse(usersJSON) : [];
  };

  const saveUsers = (users) => {
    localStorage.setItem("moneywise_users", JSON.stringify(users));
  };

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    errorMessage.textContent = "";

    if (!username || !password || !confirmPassword) {
      errorMessage.textContent = "Semua kolom harus diisi.";
      return;
    }
    if (password.length < 6) {
      errorMessage.textContent = "Password minimal harus 6 karakter.";
      return;
    }
    if (password !== confirmPassword) {
      errorMessage.textContent =
        "Password dan konfirmasi password tidak cocok.";
      return;
    }

    const users = getUsers();
    const userExists = users.some(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
    if (userExists) {
      errorMessage.textContent = "Username ini sudah digunakan.";
      return;
    }

    // --- LOGIKA KEAMANAN BARU ---
    // 1. Hash password sebelum disimpan
    const hashedPassword = CryptoJS.SHA256(password).toString();

    // 2. Simpan HASH, bukan password asli
    const newUser = { username: username, password: hashedPassword };
    users.push(newUser);
    saveUsers(users);

    sessionStorage.setItem("loggedInUser", username);
    alert("Pendaftaran berhasil! Anda akan langsung masuk ke aplikasi.");
    window.location.href = "app.html";
  });
});
