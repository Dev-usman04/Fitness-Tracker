const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');
const goalRoutes = require('./routes/goals');
const badgeRoutes = require('./routes/badges');
const reminderRoutes = require('./routes/reminders');

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/reminders', reminderRoutes);

app.get('/', (req, res) => {
  res.send('Fitness Tracker API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 