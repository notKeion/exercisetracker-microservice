const express = require('express');
const app = express();
const cors = require('cors');

require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// In-memory storage
const users = [];
const exercises = [];
let id = 1;

// POST /api/users: Create a new user (user _id as a string)
app.post('/api/users', function(req, res) {
  const username = req.body.username;
  const newUser = { username, _id: id.toString() };
  users.push(newUser);
  id++;
  res.json(newUser);
});

// POST /api/users/:_id/exercises: Add an exercise to a user
app.post('/api/users/:_id/exercises', function(req, res) {
  const { description, duration, date } = req.body;
  const { _id } = req.params;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).send("User not found");

  // Use the provided date or default to current date
  let exerciseDate;
  if (date && date.trim() !== "") {
    exerciseDate = new Date(date);
  } else {
    exerciseDate = new Date();
  }

  // Create and store the exercise record
  const exercise = {
    _id: _id, // references the user's _id
    description,
    duration: Number(duration),
    date: exerciseDate  // store as a Date object
  };

  exercises.push(exercise);

  // Respond with the user object plus the exercise data
  res.json({
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString()
  });
});

// GET /api/users: Return an array of all users
app.get('/api/users', function(req, res) {
  res.json(users);
});

// GET /api/users/:_id/logs: Retrieve a user's full exercise log with optional filters
app.get('/api/users/:_id/logs', function(req, res) {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).send("User not found");

  // Get all exercises for the specific user
  let userExercises = exercises.filter(ex => ex._id === _id);

  // Filter by 'from' date if provided
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(ex => ex.date >= fromDate);
  }

  // Filter by 'to' date if provided
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(ex => ex.date <= toDate);
  }

  // Save full count after filtering (even if limited later)
  const count = userExercises.length;

  // Apply limit if provided (convert limit to a number)
  if (limit) {
    userExercises = userExercises.slice(0, Number(limit));
  }

  // Map each exercise to an object with description, duration, and date properties.
  const log = userExercises.map(ex => ({
    description: ex.description,
    duration: ex.duration,
    date: ex.date.toDateString()
  }));

  res.json({
    _id: user._id,
    username: user.username,
    count,
    log
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});