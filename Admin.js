// ---------- LOGIN SYSTEM ----------
async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("error-msg");

    const res = await fetch("../assets/key.json");
    const data = await res.json();
    const users = data.users;

    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const user = users.find(u => u.username === username && u.password === hashHex);

    if (!user) {
        errorMsg.textContent = "Invalid username or password";
        return;
    }
    if (user.banned) {
        window.location.href = "banned.html";
        return;
    }
    if (new Date(user.expiry) < new Date()) {
        errorMsg.textContent = "Your key has expired";
        return;
    }

    sessionStorage.setItem("user", JSON.stringify(user));
    window.location.href = "dashboard.html";
}

// ---------- LOGOUT ----------
function logout() {
    sessionStorage.removeItem("user");
    window.location.href = "login.html";
}

// ---------- USER MANAGEMENT ----------
async function loadUsers() {
    const res = await fetch("../assets/key.json");
    const data = await res.json();
    const tbody = document.querySelector("#users-table tbody");
    tbody.innerHTML = "";

    data.users.forEach((u, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${u.username}</td>
        <td>${u.role}</td>
        <td>${u.expiry}</td>
        <td>${u.banned}</td>
        <td>${u.theme}</td>
        <td>
            <button onclick="toggleBan(${index})">${u.banned ? "Unban" : "Ban"}</button>
        </td>`;
        tbody.appendChild(tr);
    });
}

function addUser() {
    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;
    const expiry = document.getElementById("new-expiry").value;
    const role = document.getElementById("new-role").value;
    const theme = document.getElementById("new-theme").value;

    if (!username || !password || !expiry) return alert("Fill all fields!");

    crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
    .then(hashBuffer => {
        const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        // NOTE: Normally you save to server, here demo only
        alert(`User "${username}" created with password hash: ${hashHex}`);
        location.reload();
    });
}

function toggleBan(index) {
    alert(`Toggle ban for user at index ${index}. In production, update key.json`);
}

// ---------- INIT ----------
if (document.querySelector("#users-table")) loadUsers();
