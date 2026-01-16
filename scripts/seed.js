const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load Models
const User = require('./models/User');
const Game = require('./models/Game');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    // Delete everything
    await Post.deleteMany();
    await Comment.deleteMany();
    await User.deleteMany();
    await Game.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Run destroy if -d flag is present
if (process.argv[2] === '-d') {
  destroyData();
}