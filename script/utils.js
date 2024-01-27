const readline = require("node:readline/promises");
const https = require("https");

// util wrapper over readline.question to add isRequired support.
const askAsync = async (query, isRequired) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    let answer = await rl.question(query);

    // trimming whitespaces.
    answer = answer.trim();

    if (isRequired && !answer) {
        console.log("This field is required.");
        rl.close();
        return await askAsync(query, isRequired);
    }

    rl.close();
    return answer;
};

// Function to print the score leaderboard.
function printScoreTable(data) {
    // Header
    console.log("____________________________________________________________");
    console.log("| Position | Username  | Single Core (s) | Multi Core (s)  |");
    console.log("____________________________________________________________");

    // Data rows
    data.forEach((item, index) => {
        const singleCoreSeconds = (item.score.singleCoreScore / 1e9).toFixed(3);
        const multiCoreSeconds = (item.score.multiCoreScore / 1e9).toFixed(3);
        console.log(
            `|${index + 1}\t   | ${item.username.padEnd(
                10
            )}   | ${singleCoreSeconds.padStart(
                10
            )}   | ${multiCoreSeconds.padStart(10)} |`
        );
    });

    // Footer
    console.log(
        "_____________________________________________________________"
    );
}

// Function to hit score api endpoint
const sendScoreUpdate = async (username, score) => {
    const data = JSON.stringify({ username, score });

    const options = {
        hostname: "dechains-computing-benchmark.herokuapp.com",
        // port: 80,
        path: "/submit-score",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data),
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                resolve(data);
            });
        });

        req.on("error", (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

function calculateFinalScore(
    singleCoreTime,
    multiCoreTime,
    totalSingleCoreOperations,
    totalMultiCoreOperations
) {
    return (singleCoreTime + multiCoreTime) / 2;
}

module.exports = {
    askAsync,
    printScoreTable,
    sendScoreUpdate,
    calculateFinalScore,
};
