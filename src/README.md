# ASE285 Team Project - TaskFlow

A full-stack Todo application with a React frontend and Express/Mongoose backend.

## Project Structure

```
src/
├── backend/          # Express + Mongoose API server
│   ├── models/       # Mongoose schemas (Post, Counter)
│   ├── routes/       # API routes
│   ├── util/         # Database utilities
│   └── index.js      # Server entry point
└── frontend/         # React + Vite application
    └── src/
        ├── components/   # React components
        └── App.jsx       # Main app component
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)
- npm (comes with Node.js)

## Getting Started

### Step 1: Set Up MongoDB

1. Create a free MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster (M0 free tier)
3. Create a database user with password
4. Get your connection string

### Step 2: Configure Backend Environment

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create a `.env` file from the template:
   ```bash
   cp env .env
   ```

3. Edit `.env` with your MongoDB credentials:
   ```env
   MONGO_USER=your_actual_username
   MONGO_PASSWORD=your_actual_password
   MONGO_CLUSTER=cluster0.xxxxx.mongodb.net
   ```

### Step 3: Start the Backend

```bash
# From src/backend directory
cd backend
npm install
npm start
```

The backend will run at **http://localhost:5500**

You should see:
```
MongoDB connected successfully
Server listening on port 5500
API available at http://localhost:5500/api/posts
```

### Step 4: Start the Frontend

Open a **new terminal** window:

```bash
# From src/frontend directory
cd frontend
npm install
npm run dev
```

The frontend will run at **http://localhost:5173**

## Running Both Servers

You need **two terminal windows** (both starting from the `src` folder):

| Terminal 1 (Backend) | Terminal 2 (Frontend) |
|---------------------|----------------------|
| `cd backend` | `cd frontend` |
| `npm install` | `npm install` |
| `npm start` | `npm run dev` |
| Runs on :5500 | Runs on :5173 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List all todos |
| GET | `/api/posts/:id` | Get single todo |
| POST | `/api/posts` | Create todo |
| PUT | `/api/posts/:id` | Update todo |
| DELETE | `/api/posts/:id` | Delete todo |

## Troubleshooting

### Backend won't connect to MongoDB
- Check your `.env` file has correct credentials
- Make sure your IP is whitelisted in MongoDB Atlas (or use 0.0.0.0/0 for development)
- Verify cluster name is correct

### Frontend can't reach backend
- Make sure backend is running on port 5500
- Check browser console for CORS errors
- Verify both servers are running

### "npm: command not found"
- Make sure Node.js is installed
- Restart your terminal after installing Node.js

## Team Members

- [Add team member names here]

## License

ISC

