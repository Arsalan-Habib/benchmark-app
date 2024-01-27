const express = require("express");
// const sqlite3 = require("sqlite3").verbose();
// const db = new sqlite3.Database("database.db");

const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// using in memory db for simplicity.
const db = {};

const app = express();
const port = 80;

const getAvgScore = (user) => {
    const { singleCoreScore, multiCoreScore } = db[user];
    return (singleCoreScore + multiCoreScore) / 2;
};

const getLeaderboard = () => {
    // sorting users by avg of single and multi core test cores.
    const sortedUsers = Object.keys(db).sort(
        (a, b) => getAvgScore(a) - getAvgScore(b)
    );

    const leaderboard = sortedUsers.map((user) => ({
        username: user,
        score: db[user],
    }));

    return leaderboard;
};

app.use(express.json());

// Endpoint to get leaderboard
app.get("/", (req, res) => {
    const leaderboard = getLeaderboard();

    return res.status(200).json({
        message: "Leaderboard fetched successfully!",
        data: leaderboard,
        variables: {
            DISCORD_APPLICATION_ID,
            DISCORD_PUBLIC_KEY,
            DISCORD_BOT_TOKEN,
        },
    });
});

// Endpoint to submit score
app.post("/submit-score", (req, res) => {
    const { username, score } = req.body;
    if (!username || !score) {
        return res.status(400).send("Missing username or score");
    }

    db[`${username}`] = score;

    const leaderboard = getLeaderboard();

    res.status(200).json({
        message: "Score submitted successfully!",
        data: leaderboard,
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
