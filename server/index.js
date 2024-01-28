const express = require("express");
const { connectDB } = require("./db");
const { getLeaderboard, addBenchmark, getRank } = require("./benchmark");

const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

connectDB();

const app = express();
const port = 80;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Endpoint to get leaderboard
app.get("/", async (req, res) => {
    const leaderboard = await getLeaderboard();

    return res.status(200).json({
        message: "Leaderboard fetched successfully!",
        data: leaderboard,
    });
});

// Endpoint to submit score
app.post("/score", async (req, res) => {
    const { username, score } = req.body;

    console.log(req.body.score);

    if (!username || !score) {
        return res.status(400).send("Missing username or score details.");
    }

    const benchmark = {
        username,
        ...score,
    };

    await addBenchmark(benchmark);

    const rank = await getRank(score.overallScore);

    return res.status(200).json({
        message: "Score submitted successfully!",
        data: {
            rank,
        },
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
