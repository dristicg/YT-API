const express = require('express');
const bcrypt = require('bcrypt'); // For password hashing
const { MongoClient } = require('mongodb'); // MongoDB driver

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
const uri = "mongodb://localhost:27017";
let usersCollection;

async function initializeDatabase() {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("shopAround"); // Replace with your database name
    usersCollection = db.collection("users"); // Replace with your collection name
}

// Login route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body; // Get user input

        // Check if the user exists
        const user = await usersCollection.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // If credentials are valid
        res.status(200).json({ message: "Login successful", userId: user._id });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Start the server
app.listen(port, async () => {
    await initializeDatabase();
    console.log(`Server running at http://localhost:${port}`);
});
