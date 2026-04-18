# SubFlow Backend API

A RESTful API for the SubFlow Subscription Tracker. Built with **Node.js**, **Express**, and **MongoDB**.

---

## 📁 Folder Structure

```
subflow-backend/
├── .env.example              ← Copy to .env and fill values
├── .gitignore
├── package.json
└── src/
    ├── server.js             ← Entry point
    ├── config/
    │   └── db.js             ← MongoDB connection
    ├── models/
    │   ├── User.js           ← User schema
    │   ├── Income.js         ← Income schema
    │   └── Expense.js        ← Expense/subscription schema
    ├── controllers/
    │   ├── authController.js
    │   ├── incomeController.js
    │   └── expenseController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── incomeRoutes.js
    │   └── expenseRoutes.js
    ├── middleware/
    │   ├── auth.js           ← JWT protect middleware
    │   └── errorHandler.js   ← Global error handler + validator
    └── utils/
        ├── jwt.js            ← Token helpers + response helpers
        └── api.client.js     ← Drop this into your React project
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
cd subflow-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
```

### 3. Start MongoDB
```bash
# Local:
mongod

# Or use MongoDB Atlas (free cloud): https://www.mongodb.com/atlas
# Set MONGO_URI=mongodb+srv://... in .env
```

### 4. Run the server
```bash
npm run dev      # Development (nodemon auto-reload)
npm start        # Production
```

Server runs at: **http://localhost:5000**

---

## 🔗 API Endpoints

### Health Check
| Method | Endpoint  | Description        |
|--------|-----------|--------------------|
| GET    | /health   | Server health check |

---

### 🔐 Auth  — `/api/auth`

| Method | Endpoint               | Auth | Description           |
|--------|------------------------|------|-----------------------|
| POST   | /register              | ❌   | Create account        |
| POST   | /login                 | ❌   | Login, get tokens     |
| POST   | /refresh-token         | ❌   | Refresh access token  |
| POST   | /logout                | ✅   | Invalidate token      |
| GET    | /profile               | ✅   | Get logged-in user    |
| PUT    | /profile               | ✅   | Update name/currency  |
| PUT    | /change-password       | ✅   | Change password       |

#### Register body
```json
{
  "name": "Alex Kumar",
  "email": "alex@example.com",
  "password": "securepass123",
  "currency": "INR"
}
```

#### Login body
```json
{
  "email": "alex@example.com",
  "password": "securepass123"
}
```

#### Login response
```json
{
  "success": true,
  "message": "Login successful.",
  "user": { "_id": "...", "name": "Alex Kumar", "email": "...", "currency": "INR" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### 💰 Income — `/api/income`
> All routes require `Authorization: Bearer <token>`

| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| GET    | /                   | List all income (filters)|
| GET    | /analytics          | Income analytics + charts|
| GET    | /:id                | Get single income        |
| POST   | /                   | Add income entry         |
| PUT    | /:id                | Update income entry      |
| DELETE | /:id                | Delete income entry      |

#### Query params for GET /
- `category` — Filter by category (Salary, Freelance, Passive, Investment, Business, Other)
- `cycle` — Filter by cycle (monthly, yearly, weekly, quarterly, one-time)
- `startDate` / `endDate` — Date range (ISO 8601)
- `page`, `limit` — Pagination
- `sort` — Sort field (default: `-date`)

#### POST / body
```json
{
  "name": "Monthly Salary",
  "amount": 120000,
  "category": "Salary",
  "cycle": "monthly",
  "date": "2025-04-05",
  "emoji": "💰",
  "notes": "April salary"
}
```

---

### 📉 Expenses — `/api/expenses`
> All routes require `Authorization: Bearer <token>`

| Method | Endpoint            | Description                   |
|--------|---------------------|-------------------------------|
| GET    | /dashboard          | Full dashboard summary        |
| GET    | /analytics          | Expense analytics + charts    |
| GET    | /                   | List all expenses (filters)   |
| GET    | /:id                | Get single expense            |
| POST   | /                   | Add expense/subscription      |
| PUT    | /:id                | Update expense                |
| PATCH  | /:id/cancel         | Cancel subscription           |
| DELETE | /:id                | Delete expense                |

#### Query params for GET /
- `category` — Filter by category
- `cycle` — Filter by cycle
- `upcoming=true` — Only upcoming bills
- `days` — Days window for upcoming (default: 7)
- `startDate` / `endDate`, `page`, `limit`, `sort`

#### POST / body
```json
{
  "name": "Netflix Premium",
  "amount": 649,
  "category": "Entertainment",
  "cycle": "monthly",
  "date": "2025-04-04",
  "nextBilling": "2025-05-04",
  "emoji": "🎬",
  "notes": "4K plan"
}
```

#### GET /dashboard response
```json
{
  "summary": {
    "totalIncome": 225800,
    "totalExpenses": 15527,
    "balance": 210273,
    "savingsRate": 93.1,
    "incomeCount": 4,
    "expenseCount": 6
  },
  "upcomingBills": [...],
  "recentTransactions": [...]
}
```

---

## 🔒 Authentication Flow

```
1. POST /api/auth/register  →  get accessToken + refreshToken
2. Store both tokens in localStorage
3. Send accessToken in every request: Authorization: Bearer <token>
4. When accessToken expires (7d), call POST /api/auth/refresh-token
5. POST /api/auth/logout  →  clears refreshToken on server
```

---

## ⚡ Connect to React Frontend

1. Copy `src/utils/api.client.js` into your React project at `src/utils/api.js`
2. Add to your React `.env`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
3. Use in your context/components:
   ```js
   import { authAPI, incomeAPI, expenseAPI } from '../utils/api'

   // Login
   const { user, accessToken } = await authAPI.login({ email, password })

   // Get income
   const { income } = await incomeAPI.getAll({ category: 'Salary' })

   // Add expense
   const { expense } = await expenseAPI.create({ name: 'Netflix', amount: 649, ... })

   // Dashboard summary
   const { summary, upcomingBills } = await expenseAPI.getDashboard()
   ```

---

## 🛡 Security Features

- Passwords hashed with **bcryptjs** (12 salt rounds)
- **JWT** access tokens (7d) + refresh tokens (30d)
- **Helmet** for HTTP security headers
- **Rate limiting** — 100 req/15min globally, 20 for auth
- **CORS** whitelist
- **express-validator** on all input fields
- MongoDB injection protection via Mongoose

---

## 📦 Tech Stack

| Package            | Purpose                    |
|--------------------|----------------------------|
| express            | HTTP server & routing      |
| mongoose           | MongoDB ODM                |
| bcryptjs           | Password hashing           |
| jsonwebtoken       | JWT generation/verification|
| express-validator  | Input validation           |
| helmet             | Security headers           |
| express-rate-limit | Rate limiting              |
| cors               | Cross-origin requests      |
| morgan             | HTTP request logging       |
| dotenv             | Environment variables      |
| nodemon            | Dev auto-restart           |
