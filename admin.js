async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("error-msg");

    // Load key.json
    const res = await fetch("../assets/key.json");
    const data = await res.json();
    const users = data.users;

    // Simple SHA-256 hashing (for demo; use bcrypt on server)
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const user = users.find(u => u.username === username && u.password === hashHex);

    if (!user) {
        errorMsg.textContent = "Invalid username or password";
        return;
    }

    if (user.banned) {
        window.location.href = "banned.html";
        return;
    }

    const now = new Date();
    if (new Date(user.expiry) < now) {
        errorMsg.textContent = "Your key has expired";
        return;
    }

    // Save session
    sessionStorage.setItem("user", JSON.stringify(user));

    // Redirect to dashboard
    window.location.href = "dashboard.html";
}
