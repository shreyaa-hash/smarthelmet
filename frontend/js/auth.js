const API_BASE = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'http://localhost:8000/backend/api' 
    : '../backend/api';

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form-container').forEach(f => f.classList.remove('active'));
    
    if(tab === 'login') {
        document.querySelectorAll('.tab')[0].classList.add('active');
        document.getElementById('login-form').classList.add('active');
    } else {
        document.querySelectorAll('.tab')[1].classList.add('active');
        document.getElementById('register-form').classList.add('active');
    }
}

async function login() {
    const user = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;
    const msg = document.getElementById('login-msg');

    if(!user || !pass) {
        msg.textContent = "Please fill all fields";
        msg.className = "msg error";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: user, password: pass })
        });
        
        let rawText;
        try {
            rawText = await response.text();
        } catch(e) {}
        
        let data;
        try {
            data = JSON.parse(rawText);
        } catch (parseErr) {
            alert("SERVER CRASHED (LOGIN):\n\n" + rawText);
            msg.textContent = "Server crashed. Check popup.";
            msg.className = "msg error";
            return;
        }

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            msg.textContent = data.message || 'Login failed';
            msg.className = "msg error";
        }
    } catch (e) {
        alert("FETCH FAILED (LOGIN): " + e.message);
        msg.textContent = "Network connection failed";
        msg.className = "msg error";
    }
}

async function register() {
    const user = document.getElementById('reg-username').value;
    const pass = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;
    const msg = document.getElementById('reg-msg');

    if(!user || !pass) {
        msg.textContent = "Please fill all fields";
        msg.className = "msg error";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: user, password: pass, role: role })
        });
        
        let rawText;
        try {
            rawText = await response.text();
        } catch(e) {}
        
        let data;
        try {
            data = JSON.parse(rawText);
        } catch (parseErr) {
            alert("SERVER CRASHED (REGISTER):\n\n" + rawText);
            msg.textContent = "Server crashed. Check popup.";
            msg.className = "msg error";
            return;
        }

        if(response.ok) {
            msg.textContent = "Registration successful! Please login.";
            msg.className = "msg success";
            setTimeout(() => switchTab('login'), 2000);
        } else {
            msg.textContent = data.message || 'Registration failed';
            msg.className = "msg error";
        }
    } catch (e) {
        alert("FETCH FAILED (REGISTER): " + e.message);
        msg.textContent = "Network connection failed";
        msg.className = "msg error";
    }
}

// Check if already logged in
if(localStorage.getItem('user') && window.location.pathname.endsWith('index.html')) {
    window.location.href = 'dashboard.html';
}
