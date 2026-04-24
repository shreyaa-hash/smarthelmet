const API_BASE = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'http://localhost:8000/backend/api' 
    : '../backend/api';

// Thresholds
const THRESHOLDS = {
    gas: 400,      // ppm
    temp: 45,      // °C
    distance: 20   // cm (minimum distance)
};

// Check Auth
const user = JSON.parse(localStorage.getItem('user'));
if(!user) {
    window.location.href = 'index.html';
}
document.getElementById('user-display').textContent = `👤 ${user.username} (${user.role})`;

// Role-based UI setup
document.addEventListener('DOMContentLoaded', () => {
    if (user.role === 'miner') {
        document.querySelector('.nav-brand h1').textContent = 'My Helmet Status';
        document.querySelector('.charts-section').style.display = 'none';
        document.querySelector('.history-section').style.display = 'none';
    } else {
        document.querySelector('.nav-brand h1').textContent = 'SafeX Admin Center';
    }
});

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    updateChartTheme();
});

// Chart.js Setup
const ctx = document.getElementById('mainChart').getContext('2d');
Chart.defaults.color = htmlElement.getAttribute('data-theme') === 'dark' ? '#cbd5e1' : '#64748b';
Chart.defaults.font.family = "'Inter', sans-serif";

const mainChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Gas (ppm)',
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                data: [],
                yAxisID: 'y',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Temperature (°C)',
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                data: [],
                yAxisID: 'y1',
                fill: true,
                tension: 0.4
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
            x: { grid: { color: 'rgba(100, 116, 139, 0.1)' } },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: { color: 'rgba(100, 116, 139, 0.1)' }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false }
            }
        }
    }
});

function updateChartTheme() {
    const isDark = htmlElement.getAttribute('data-theme') === 'dark';
    Chart.defaults.color = isDark ? '#cbd5e1' : '#64748b';
    mainChart.options.scales.x.grid.color = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    mainChart.options.scales.y.grid.color = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    mainChart.update();
}

// Data Fetching & UI Update
const maxDataPoints = 20;

function checkAlerts(data) {
    const aiAlert = document.getElementById('ai-alert');
    const aiMsg = document.getElementById('ai-message');
    let hasAlert = false;
    let messages = [];

    // Reset card styles
    document.querySelectorAll('.sensor-card').forEach(c => {
        c.classList.remove('alert-danger', 'alert-warning');
    });

    if (data.gas > THRESHOLDS.gas) {
        document.getElementById('card-gas').classList.add('alert-danger');
        messages.push("Danger: Toxic gas detected!");
        hasAlert = true;
    }
    
    if (data.temperature > THRESHOLDS.temp) {
        document.getElementById('card-temp').classList.add('alert-warning');
        messages.push("Warning: High temperature risk.");
        hasAlert = true;
    }

    if (data.distance < THRESHOLDS.distance) {
        document.getElementById('card-dist').classList.add('alert-warning');
        messages.push("Alert: Obstacle very close.");
        hasAlert = true;
    }

    if (hasAlert) {
        aiAlert.classList.remove('hidden');
        aiAlert.classList.remove('warning');
        
        if (data.gas > THRESHOLDS.gas) {
            // Red alert for gas
        } else {
            // Orange warning for others
            aiAlert.classList.add('warning');
        }
        
        aiMsg.textContent = messages.join(' | ');
        // document.getElementById('alertSound').play().catch(e=>console.log("Audio play prevented"));
    } else {
        aiAlert.classList.add('hidden');
    }
}

async function fetchLatestData() {
    try {
        const response = await fetch(`${API_BASE}/get-latest-data.php`);
        if (response.ok) {
            const data = await response.json();
            
            // Update UI Cards
            document.getElementById('val-gas').textContent = data.gas;
            document.getElementById('val-temp').textContent = data.temperature;
            document.getElementById('val-hum').textContent = data.humidity;
            document.getElementById('val-dist').textContent = data.distance;
            document.getElementById('val-moist').textContent = data.moisture;

            // Check alerts
            checkAlerts(data);

            // Update Chart (Admin Only)
            if (user.role === 'admin') {
                const timeStr = new Date(data.timestamp).toLocaleTimeString();
                
                if (mainChart.data.labels.length >= maxDataPoints) {
                    mainChart.data.labels.shift();
                    mainChart.data.datasets[0].data.shift();
                    mainChart.data.datasets[1].data.shift();
                }
                
                mainChart.data.labels.push(timeStr);
                mainChart.data.datasets[0].data.push(data.gas);
                mainChart.data.datasets[1].data.push(data.temperature);
                mainChart.update();
            }
        }
    } catch (e) {
        console.error("Error fetching latest data:", e);
    }
}

async function fetchHistory() {
    try {
        const response = await fetch(`${API_BASE}/get-history.php?limit=10`);
        if (response.ok) {
            const data = await response.json();
            const tbody = document.getElementById('historyBody');
            tbody.innerHTML = '';
            
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(row.timestamp).toLocaleString()}</td>
                    <td class="${row.gas > THRESHOLDS.gas ? 'text-danger' : ''}">${row.gas}</td>
                    <td class="${row.temperature > THRESHOLDS.temp ? 'text-warning' : ''}">${row.temperature}</td>
                    <td>${row.humidity}</td>
                    <td class="${row.distance < THRESHOLDS.distance ? 'text-warning' : ''}">${row.distance}</td>
                    <td>${row.moisture}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error("Error fetching history:", e);
    }
}

// Initial Load
fetchLatestData();
if (user.role === 'admin') {
    fetchHistory();
}

// Set interval for real-time updates (every 3 seconds)
setInterval(fetchLatestData, 3000);
