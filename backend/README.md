# Fitness Tracker Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
3. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and get JWT

### Workouts (protected)
- `GET /api/workouts` — Get all workouts for user
- `POST /api/workouts` — Create a workout
- `PUT /api/workouts/:id` — Update a workout
- `DELETE /api/workouts/:id` — Delete a workout

Send JWT as `Authorization: Bearer <token>` header for protected routes. 