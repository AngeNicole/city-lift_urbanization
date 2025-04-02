## This is a monorepo that consists (frontend and backend)
---
## **CityLift Connect - Frontend**
A modern frontend for **CityLift Connect**, built with **React, Vite, TypeScript, TailwindCSS, and React Query**, using **Bun** as the package manager.

### **🚀 Getting Started**
### **Prerequisites**
- **Node.js** (Optional, if using Bun)
- **Bun** (Ensure you have [Bun installed](https://bun.sh/docs/installation))
- **Google Maps API Key** (for location-based services)

### **📦 Installation**
1. **Clone the repository**
   ```sh
   git clone https://github.com/AngeNicole/city-lift_urbanization.git
   cd frontend
   ```

2. **Install dependencies using Bun**
   ```sh
   bun install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root directory and add:
     ```
     VITE_BASE_URL=https://lift-city-connect-server.onrender.com/api
     VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     ```

4. **Run the development server**
   ```sh
   bun run dev
   ```
   The app should now be available at **`http://localhost:5173/`**.

### **🔐 Authentication**
- Users must be logged in to access protected routes.
- If not authenticated, they are redirected to the **Sign-In** page.

### **📂 Project Structure**
```
/src
 ├── components/       # Reusable UI components
 ├── pages/            # Page components
 ├── context/          # Global state management (Auth)
 ├── hooks/            # Custom React hooks
 ├── lib/              # Utility functions & constants
 ├── styles/           # Global styles
 ├── App.tsx           # Main application file
 ├── main.tsx          # Entry point
 └── vite.config.ts    # Vite configuration
```

### **🔧 Available Scripts**
- **Run the project**
  ```sh
  bun run dev
  ```
- **Build for production**
  ```sh
  bun run build
  ```
- **Preview the production build**
  ```sh
  bun run preview
  ```
- **Run ESLint**
  ```sh
  bun run lint
  ```

### **🌎 API Integration**
The app interacts with the **CityLift Connect API**, hosted at:
```
https://lift-city-connect-server.onrender.com/api
```
Endpoints include:
- `GET /vehicles` - Fetch all vehicles
- `POST /vehicles` - Register a new vehicle
- `GET /auth/profile` - Fetch user profile


---

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
git clone https://github.com/AngeNicole/city-lift_urbanization.git
cd backend
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


