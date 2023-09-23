
const mongoose = require('mongoose');

function connect() {
  mongoose.connect("mongodb+srv://rahul:lYSXshAQNi6h88mc@costa.7jhay77.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Error connecting to MongoDB:', err.message));
}

module.exports = { connect };
