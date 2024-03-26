// resolvers.js
// Connect to MongoDB
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const your_secret_key = "my_secret_key"

// Define resolvers
const resolvers = {
    Query: {
        users: async (_, { page = 1, limit = 10, sortBy = 'name' }) => {
            try {
                // Calculate skip value for pagination
                const skip = (page - 1) * limit;

                // Fetch users from MongoDB with pagination and sorting
                const users = await User.find()
                    .sort({ [sortBy]: 1 }) // Sort by the specified field in ascending order
                    .skip(skip) // Skip records based on pagination
                    .limit(limit); // Limit the number of records per page

                return users; // Return the array of users
            } catch (error) {
                console.error('Error fetching users:', error);
                throw new Error('Failed to fetch users');
            }
        },
        user: async (_, { id }) => {
            try {
                // Check if the provided ID is valid
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    throw new Error('Invalid user ID');
                }

                // Fetch the user from MongoDB by ID
                const user = await User.findById(id);

                // If user doesn't exist, throw an error
                if (!user) {
                    throw new Error('User not found');
                }

                return user; // Return the user object
            } catch (error) {
                console.error('Error fetching user:', error);
                throw new Error('Failed to fetch user');
            }
        },
    },
    Mutation: {
        login: async (_, { email, password }) => {
            try {
                // Find the user by email
                const user = await User.findOne({ email });

                // If user doesn't exist, throw an error
                if (!user) {
                    throw new Error('Invalid credentials');
                }

                // Check if the provided password matches the user's password
                const isPasswordValid = await bcrypt.compare(password, user.password);

                // If password doesn't match, throw an error
                if (!isPasswordValid) {
                    throw new Error('Invalid credentials');
                }

                // Generate JWT token for authenticated user
                const token = jwt.sign({ userId: user._id }, your_secret_key, { expiresIn: '5h' });

                // Return the token along with user details
                return {
                    token,
                    user,
                    message: 'Login successful',

                };
            } catch (error) {
                console.error('Error logging in:', error);
                throw new Error('Failed to login');
            }
        },

        createUser: async (_, { name, email, password }) => {
            try {
                // Logic to create a new user in MongoDB
                const user = await User.create({ name, email, password });
                return user; // Return the newly created user object
            } catch (error) {
                console.error('Error creating user:', error);
                throw new Error('Failed to create user'); // Throw an error if creation fails
            }
        },
        updateUser: async (_, { id, name, email, password }) => {
            try {
                // Check if the provided ID is valid
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    throw new Error('Invalid user ID');
                }
                let hashedPassword;
                if (password) {
                    hashedPassword = await bcrypt.hash(password, 10); // Hash password with bcrypt
                }

                // Construct update object based on provided fields
                const updateFields = {};
                if (name) updateFields.name = name;
                if (email) updateFields.email = email;
                if (hashedPassword) updateFields.password = hashedPassword;

                // Find the user by ID and update their details
                const user = await User.findByIdAndUpdate(id, updateFields, { new: true });
                // Find the user by ID and update their details
                // const user = await User.findByIdAndUpdate(id, { name, email }, { new: true });

                // If user doesn't exist, throw an error
                if (!user) {
                    throw new Error('User not found');
                }

                return user; // Return the updated user object
            } catch (error) {
                console.error('Error updating user:', error);
                throw new Error('Failed to update user');
            }
        },
        deleteUser: async (_, { id }, context) => {
            try {

                if (!context.userId) {
                    throw new Error('Unauthorized access');
                }
                // Check if the provided ID is valid
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    throw new Error('Invalid user ID');
                }

                // Find the user by ID and delete them
                const user = await User.findByIdAndDelete(id);

                // If user doesn't exist, throw an error
                if (!user) {
                    throw new Error('User not found');
                }

                return user; // Return the deleted user object
            } catch (error) {
                console.error('Error deleting user:', error);
                throw new Error('Failed to delete user');
            }
        },
    },
};


module.exports = resolvers;
