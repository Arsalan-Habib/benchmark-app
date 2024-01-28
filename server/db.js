const mongoose = require("mongoose");
const uri = process.env.MONGO_URI;

const clientOptions = {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function connectDB() {
    try {
        // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
        await mongoose.connect(uri, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } catch (err) {
        // Ensures that the client will close when you finish/error
        await mongoose.disconnect();
        console.log(err);
    }
}

module.exports = { connectDB };
