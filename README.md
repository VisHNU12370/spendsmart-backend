# SpendSmart

SpendSmart is a personal finance app built with React Native that automatically detects your transactions by reading bank SMS messages, so you don't have to log every expense by hand.

## Features

- **Automatic transaction detection** – parses transaction SMS messages and records them as expenses/income
- **Secure authentication** – JWT-based signup and login
- **Expense tracking** – view and manage your transactions in one place
- **REST API backend** – Node.js, Express and MongoDB

## Tech Stack

**Mobile app**
- React Native (Expo)
- Axios for API calls
- EAS Build for building the app

**Backend**
- Node.js
- Express.js
- MongoDB
- JSON Web Tokens (JWT) for authentication

## Project Structure

```
SpendSmart/
├── app/        # React Native (Expo) mobile app
└── server/     # Express + MongoDB backend
```

> Adjust folder names above to match your repository.

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Expo CLI / EAS CLI
- Android device or emulator (SMS reading is Android-only)

### Backend setup

```bash
cd server
npm install
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the server:

```bash
npm start
```

### Mobile app setup

```bash
cd app
npm install
npx expo start
```

Point the axios base URL in the app to your backend server (use your machine's local IP when testing on a physical device, e.g. `http://192.168.x.x:5000`).

### Building the app

```bash
eas build --platform android
```

## API Overview

| Method | Endpoint             | Description              |
|--------|----------------------|--------------------------|
| POST   | `/api/auth/register` | Register a new user      |
| POST   | `/api/auth/login`    | Log in and receive a JWT |
| GET    | `/api/transactions`  | Get the user's transactions (auth required) |
| POST   | `/api/transactions`  | Add a transaction (auth required) |

> Update the endpoints to match your actual routes.

## Permissions

The app requests SMS read permission on Android to detect transactions. Messages are used only to extract transaction details.

## Roadmap

- Spending analytics and category insights
- Budgets and alerts
- Improved SMS parsing for more banks

## Author

Vishnu
