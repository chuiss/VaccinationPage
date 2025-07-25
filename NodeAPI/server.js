const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1/vaccination', { useNewUrlParser: true, useUnifiedTopology: true });

// Routes
app.use('/api/users', require('./route/users'));
app.use('/api/vaccines', require('./route/vaccines'));
app.use('/api/hospitals', require('./route/hospitals'));
app.use('/api/appointments', require('./route/appointments'));

// Custom 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'notFound.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`NodeAPI running on port ${PORT}`));
