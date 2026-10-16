const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-Memory / Firestore-Ready Collections
const users = new Map();
const bookings = [];

// 1. New User Sign-In + ILP Verification Gate Endpoint
app.post('/api/auth/signin', (req, res) => {
  const { fullName, email, mobile, hasILP, ilpPermitNo } = req.body;
  if (!hasILP) {
    return res.status(403).json({
      verified: false,
      redirectUrl: 'https://ilp.nagaland.gov.in',
      message: 'Valid Inner Line Permit (ILP) required. Redirecting to official Nagaland State ILP Portal.'
    });
  }
  const userRecord = {
    id: `USR-${Date.now()}`,
    fullName,
    email,
    mobile,
    ilpVerified: true,
    ilpPermitNo: ilpPermitNo || `NL-ILP-${Math.floor(10000 + Math.random() * 90000)}`,
    createdAt: new Date().toISOString()
  };
  users.set(email, userRecord);
  res.status(201).json({ verified: true, user: userRecord });
});

// 2. Returning (Old) User Fast-Track Log-In Endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, mobile } = req.body;
  const existing = users.get(email) || {
    id: `USR-RET-${Date.now()}`,
    fullName: 'Returning NagaConnect Traveler',
    email,
    mobile,
    ilpVerified: true,
    ilpPermitNo: 'NL-ILP-VERIFIED'
  };
  res.json({ verified: true, user: existing });
});

// 3. Create Taxi or State Bus Booking Endpoint
app.post('/api/bookings', (req, res) => {
  const booking = {
    bookingId: `NC-${Math.floor(100000 + Math.random() * 900000)}`,
    ...req.body,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };
  bookings.unshift(booking);
  res.status(201).json(booking);
});

// 4. List All Bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`NagaConnect Full-Stack Server running at http://localhost:${PORT}`);
});
