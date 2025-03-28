# CityLift Connect - Backend

## 🚀 Project Overview
CityLift Connect is a web-based urban transportation platform designed to enhance mobility efficiency in Rwanda. The platform integrates **cable cars, e-bikes, and e-scooters** into the city's transport network, offering an eco-friendly, tech-driven solution to urban congestion.

This backend is built using **Node.js (Express)** with **MongoDB (Prisma ORM)** and features **authentication, ride management, payments, and vehicle tracking**.

## 📌 Tech Stack
- **Backend**: Node.js (Express)
- **Database**: MongoDB (via Prisma ORM)
- **Authentication**: JWT (JSON Web Tokens) & bcrypt.js for password hashing
- **API Testing**: Postman

---

## 🛠️ Setup & Installation

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-repo/citylift-connect-backend.git
cd citylift-connect-backend
```

### 2️⃣ Install Dependencies
```sh
yarn install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file and add the following:
```env
PORT=4000
DATABASE_URL="mongodb+srv://your-mongodb-uri"
JWT_SECRET="your_jwt_secret"
```

### 4️⃣ Setup Prisma (MongoDB)
```sh
yarn prisma generate
yarn prisma db push
```

### 5️⃣ Start the Server
```sh
yarn dev
```
The server should now be running on `http://localhost:4000`

---

## 🚏 API Endpoints

### 🔑 Authentication
| Method | Endpoint        | Description |
|--------|----------------|-------------|
| POST   | `/auth/register` | Register a new user and return a token |
| POST   | `/auth/login` | Login and get an authentication token |
| GET    | `/auth/profile` | Get the logged-in user profile |
| POST   | `/auth/change-password` | Update user password |

### 👥 User Management
| Method | Endpoint       | Description |
|--------|---------------|-------------|
| GET    | `/users` | Get all users (Admin only) |

### 🚖 Ride Management
| Method | Endpoint        | Description |
|--------|----------------|-------------|
| POST   | `/rides` | Book a new ride |
| GET    | `/rides/:id` | Get ride details by ID |
| PUT    | `/rides/:id/status` | Update ride status (Complete/Cancel) |

### 🏍️ Vehicle Management
| Method | Endpoint        | Description |
|--------|----------------|-------------|
| POST   | `/vehicles` | Add a new vehicle |
| GET    | `/vehicles/nearby` | Get nearby available vehicles |

### 💳 Payment Processing
| Method | Endpoint        | Description |
|--------|----------------|-------------|
| POST   | `/payments` | Process a ride payment |
| GET    | `/payments/ride/:rideId` | Get payment details for a ride |

---

## 🗺️ How Location-Based Search Works
- **Vehicles store their latitude & longitude**
- Users can **search for nearby vehicles** by sending their current coordinates
- Uses **MongoDB geospatial queries** to return available rides within a specified radius

Example:
```
GET /vehicles/nearby?latitude=-1.9501&longitude=30.0589&radius=5
```

---

## ✅ Testing with Postman
1. **Import Postman Collection** (Download from `docs/postman_collection.json`)
2. **Set environment variables** (`base_url = http://localhost:4000`)
3. **Run API requests and validate responses**

---

## 🏗️ Future Improvements
- **Live ride tracking** via WebSockets
- **AI-based route optimization**
- **Loyalty & rewards system for frequent riders**

---

## 🤝 Contributions
Feel free to fork this repo and submit pull requests! 🚀

