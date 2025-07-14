window.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username-input");
  const passwordInput = document.getElementById("password-input");
  const errorMessage = document.getElementById("error-message");

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    errorMessage.textContent = "";

    let users = [];
    try {
      const usersJSON = localStorage.getItem("rupiahwise_users");
      users = usersJSON ? JSON.parse(usersJSON) : [];
    } catch (e) {
      users = [];
    }

    const userFound = users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );

    // --- LOGIKA KEAMANAN BARU ---
    if (userFound) {
      // 1. Hash password yang baru dimasukkan oleh pengguna.
      const enteredPasswordHash = CryptoJS.SHA256(password).toString();

      // 2. Bandingkan HASH yang baru dengan HASH yang tersimpan.
      if (userFound.password === enteredPasswordHash) {
        // Sukses! Hashes match.
        sessionStorage.setItem("loggedInUser", userFound.username);
        window.location.href = "app.html";
      } else {
        // Password salah
        errorMessage.textContent = "Username atau password salah.";
      }
    } else {
      // Username tidak ditemukan
      errorMessage.textContent = "Username atau password salah.";
    }
  });
});
