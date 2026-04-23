# Smart Helmet Safety System

A full-stack IoT web application built with PHP, Vanilla JavaScript, and MongoDB Atlas.

## Features
- Real-time dashboard with dynamic updates
- User authentication
- MongoDB integration
- Real-time charting with Chart.js
- AI-based alerts and notifications

## Setup Instructions

### Prerequisites
1. PHP installed on your machine
2. MongoDB driver for PHP (`pecl install mongodb`)
3. Composer installed

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install MongoDB dependencies:
   ```bash
   composer install
   ```
3. Configure Database:
   - Open `backend/config/database.php`
   - Replace the `$uri` string with your MongoDB Atlas connection string.
   - Example format: `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### Frontend Setup
No build step is required since it's pure HTML/CSS/JS.

However, you must serve it via a local server (like Apache, XAMPP, or PHP built-in server) because it makes API requests and needs a proper origin.

To test using PHP's built-in server:
1. Open terminal in the project root folder.
2. Run: `php -S localhost:8000`
3. Then open `http://localhost:8000/frontend/index.html` in your browser.

**Important Note for APIs:**
In `frontend/js/auth.js` and `frontend/js/dashboard.js`, the `API_BASE` is currently set to:
`http://localhost/smart-helmet/backend/api` (Assuming an XAMPP setup).
If you are using the PHP built-in server on port 8000 as mentioned above, change `API_BASE` to:
`http://localhost:8000/backend/api`

### API Endpoints
All endpoints are located at `/backend/api/`

- `POST /register.php` - Body: `{username, password, role}`
- `POST /login.php` - Body: `{username, password}`
- `POST /sensor-data.php` - Body: `{gas, temperature, humidity, distance, moisture}` (Called by ESP32)
- `GET /get-latest-data.php`
- `GET /get-history.php?limit=50`

### Example ESP32 Payload Test
You can use Postman or cURL to test inserting data:
```bash
curl -X POST http://localhost:8000/backend/api/sensor-data.php \
-H "Content-Type: application/json" \
-d '{"gas": 420, "temperature": 46, "humidity": 80, "distance": 15, "moisture": 60}'
```
