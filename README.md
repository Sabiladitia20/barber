# Parmato Barber Studio - Booking System


Parmato, responsive web application for booking barber appointments. It provides a seamless experience for customers to browse styles, select barbers, and schedule appointments, while offering a comprehensive dashboard for administrators to manage their business.

## 🚀 Features

### for Customers
*   **Easy Booking**: Intuitive 3-step booking process (Service -> Date -> Barber & Time).
*   **Responsive Design**: Optimized for mobile and desktop devices.
*   **User Dashboard**: View appointment history and status.
*   **Authentication**: Secure Login and Registration system.
*   **Visual Style Gallery**: Browse trendy hairstyles for inspiration.

### for Admin
*   **Dashboard Overview**: View key metrics (Total Bookings, Revenue, Top Barber).
*   **Appointment Management**: Confirm, reschedule, or cancel appointments.
*   **Barber Management**: Add/Edit/Delete barbers and manage their schedules (Off Days).
*   **Service Management**: Manage services and pricing.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: Modern Vanilla CSS with variables (Dark Mode aesthetic), Glassmorphism effects.
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **State Management**: React Context API (`AuthContext`, `AlertContext`).

### Backend
*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database**: PostgreSQL
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **Authentication**: JWT (JSON Web Tokens)

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Sabiladitia20/barber.git
    cd barber
    ```

2.  **Backend Setup**
    ```bash
    # Install dependencies
    npm install

    # Setup Environment Variables (.env)
    # Ensure you have DATABASE_URL for Postgres set up

    # Run Database Migrations
    npx prisma migrate dev

    # Start Backend Server
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend

    # Install dependencies
    npm install

    # Start Development Server
    npm run dev
    ```

4.  **Access the App**
    *   Frontend: `http://localhost:5173`
    *   Backend API: `http://localhost:8000`

## 🎨 Project Structure

```
├── src/                  # Backend Source
│   ├── controllers/      # Route logic
│   ├── middleware/       # Auth middleware
│   ├── routes/           # API routes
│   └── utils/            # Helper functions (Prisma client)
├── frontend/             # Frontend Source
│   ├── src/
│   │   ├── components/   # Reusable UI components (Navbar, AlertModal)
│   │   ├── context/      # Global state (Auth, Alerts)
│   │   ├── pages/        # Page components (Home, Booking, Admin)
│   │   └── ...
└── ...
```

## 📄 License

This project is licensed under the MIT License.
