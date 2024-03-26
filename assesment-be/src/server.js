// server.js

const express = require('express');
const cors = require('cors')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ApolloServer, } = require('apollo-server-express');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

// Initialize Express app
const app = express();

app.use('*', cors({
    origin: '*'
}))

// Connect to MongoDB
const mongoose = require('mongoose');
const User = require('./models/User');

const your_secret_key = "my_secret_key"
const uri = 'mongodb+srv://nomansandhu0125:ja7N5X44z8xc34mF@assesment.kasmtaw.mongodb.net/';

mongoose.connect(uri).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Error connecting to MongoDB:', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('MongoDB connection established');
});


// Middleware to decode JWT token and add user ID to context
const authMiddleware = async ({ req }) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, your_secret_key); 
            req.userId = decoded.userId;
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    }
};
// Create an ApolloServer instance
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        // Add user ID to context
        authMiddleware({ req });
        return { userId: req.userId };
    },
});
// Start the server and apply the middleware
async function startServer() {
    await server.start();
    server.applyMiddleware({ app });
}

// Start the server
startServer().then(() => {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
    });
}).catch(error => {
    console.error('Error starting server:', error.message);
});