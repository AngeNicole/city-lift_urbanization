Here's the updated README with **Bun** as the package manager. 🚀

---

## **Lift City Connect - Client**
A modern frontend for **Lift City Connect**, built with **React, Vite, TypeScript, TailwindCSS, and React Query**, using **Bun** as the package manager.

### **🚀 Getting Started**
### **Prerequisites**
- **Node.js** (Optional, if using Bun)
- **Bun** (Ensure you have [Bun installed](https://bun.sh/docs/installation))
- **Google Maps API Key** (for location-based services)

### **📦 Installation**
1. **Clone the repository**
   ```sh
   git clone https://github.com/ishgervais/lift-city-connect-client.git
   cd lift-city-connect-client
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
The app interacts with the **Lift City Connect API**, hosted at:
```
https://lift-city-connect-server.onrender.com/api
```
Endpoints include:
- `GET /vehicles` - Fetch all vehicles
- `POST /vehicles` - Register a new vehicle
- `GET /auth/profile` - Fetch user profile

### **📜 License**
This project is licensed under the **MIT License**.

---
