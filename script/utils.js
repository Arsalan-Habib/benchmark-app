const readline = require("node:readline/promises");
const axios = require("axios");
const { MULTI_CORE_WEIGHT, DIVISION_FACTOR } = require("./parameters");
const API_BASE_URL = "https://api.score.benchmark.dev";

const api = axios.create({
    baseURL: API_BASE_URL,
});

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

// Function to hit score api endpoint
const sendScoreUpdate = async (username, score) => {
    const { data } = await api.post("/score", {
        username,
        score,
    });
    return data;
};

function calculateFinalScore(
    singleCoreTime,
    multiCoreTime,
    totalSingleCoreOperations,
    totalMultiCoreOperations
) {
    // Calculating operations per second
    const singleCoreOpsPerSecond =
        totalSingleCoreOperations / (singleCoreTime / 1e9);
    const multiCoreOpsPerSecond =
        totalMultiCoreOperations / (multiCoreTime / 1e9);

    // Applying weights: 1 for single core, whatever is specified for multi core from parameters.js
    const weightedSingleCoreScore = singleCoreOpsPerSecond;
    const weightedMultiCoreScore = multiCoreOpsPerSecond * MULTI_CORE_WEIGHT;

    // Calculate combined score
    const combinedScore =
        (weightedSingleCoreScore + weightedMultiCoreScore) / 1 +
        MULTI_CORE_WEIGHT; // Dividing by total weight (1 + MULTI_CORE_WEIGHT)

    // Dividing by division factor to normalize the score.
    const overallScore = combinedScore / (DIVISION_FACTOR || 1);

    const singleCoreScore = singleCoreOpsPerSecond / (DIVISION_FACTOR || 1);
    const multiCoreScore = multiCoreOpsPerSecond / (DIVISION_FACTOR || 1);

    return {
        overallScore,
        singleCoreScore,
        multiCoreScore,
    };
}

module.exports = {
    askAsync,
    sendScoreUpdate,
    calculateFinalScore,
};
