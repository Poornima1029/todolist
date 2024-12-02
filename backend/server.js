const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const nodemailer = require('nodemailer');
const flash = require('connect-flash');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// User Model
const User = require('./models/User');

// Create Express app
const app = express();

// Middleware
app.use(express.json()); // To parse JSON requests
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.urlencoded({ extended: true })); // For handling form submissions
app.use(session({
  secret: 'your-secret-key', // Replace with a strong secret
  resave: false,
  saveUninitialized: false,
}));
app.use(flash()); // For flash messages

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Test route for root (localhost:5000)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes for todo app (You should have a todoRoutes file in the routes folder)
const todoRoutes = require('./routes/todoRoutes');
app.use('/api', todoRoutes);

// User Authentication Routes
// Signup route
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Signup POST route
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    req.flash('error', 'User already exists!');
    return res.redirect('/signup');
  }

  // Hash the password and save the user
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  await newUser.save();
  req.flash('success', 'Registration successful! Please login.');
  res.redirect('/login');
});

// Login route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login POST route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    req.flash('error', 'Invalid email or password!');
    return res.redirect('/login');
  }

  // Create a session for the logged-in user
  req.session.user = user;
  res.redirect('/dashboard');
});

// Dashboard route (user's task list)
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Forgot Password route
app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

// Forgot Password POST route (sends reset link)
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    req.flash('error', 'No account found with this email!');
    return res.redirect('/forgot-password');
  }

  // Send reset password email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetLink = `http://localhost:5001/reset-password/${user._id}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    text: `Click the link to reset your password: ${resetLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      req.flash('error', 'Error sending email!');
      return res.redirect('/forgot-password');
    }
    req.flash('success', 'Password reset link sent to your email!');
    res.redirect('/login');
  });
});

// Reset Password page (user clicks on link from email)
app.get('/reset-password/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    req.flash('error', 'Invalid reset link');
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

// Reset Password POST route
app.post('/reset-password/:id', async (req, res) => {
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
  req.flash('success', 'Password reset successful! Please login.');
  res.redirect('/login');
});

// Connect to the database
connectDB();

// Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
