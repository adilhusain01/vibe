// Quick test script to verify MongoDB connection with optimized settings
require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
    try {
        console.log('Testing MongoDB connection...');

        await mongoose.connect(process.env.MONGO_URI, {
            // Connection pooling settings
            maxPoolSize: 50,
            minPoolSize: 5,
            maxIdleTimeMS: 30000,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            heartbeatFrequencyMS: 10000,
            retryWrites: true,
            retryReads: true,
        });

        // Set mongoose-specific buffer settings
        mongoose.set('bufferCommands', false);
        mongoose.set('bufferMaxEntries', 0);

        console.log('✅ MongoDB connected successfully with optimized settings!');
        console.log('Connection state:', mongoose.connection.readyState);
        console.log('Database name:', mongoose.connection.db.databaseName);

        // Test a simple query
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));

        await mongoose.connection.close();
        console.log('✅ Connection test completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
};

testConnection();