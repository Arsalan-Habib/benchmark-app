const { askAsync, calculateFinalScore, sendScoreUpdate } = require("./utils");
const { singleCoreTest, multiCoreTest } = require("./coreTests");
const {
    SINGLE_CORE_OPERATIONS,
    MULTI_CORE_OPERATIONS,
} = require("./parameters");
const si = require("systeminformation");

// Main execution function using async/await
const main = async () => {
    try {
        console.log("\nWelcome to the Dechains computing benchmark test!");

        const username = await askAsync("\nPlease enter your username: ", true);
        console.log(`\x1B[A\x1B[K✅ Username: ${username}`);

        console.log("\nGetting system information...");
        const cpuInfo = await si.cpu();
        // clearing the log in the above line and then new success msg, after getting cpuinfo.
        console.log("\x1B[A\x1B[K\x1B[A✅ System Information");

        const singleCoreTime = singleCoreTest(SINGLE_CORE_OPERATIONS);
        console.log("\x1B[A✅ Single Core Test");

        const multiCoreTime = await multiCoreTest(MULTI_CORE_OPERATIONS);
        console.log("\x1B[A✅ Multi Core Test");

        const { overallScore, singleCoreScore, multiCoreScore } =
            calculateFinalScore(
                singleCoreTime,
                multiCoreTime,
                SINGLE_CORE_OPERATIONS,
                MULTI_CORE_OPERATIONS
            );

        console.log("\nCalculating final score...");

        let rank;

        try {
            const response = await sendScoreUpdate(username, {
                overallScore,
                singleCoreScore,
                multiCoreScore,
                singleCoreTime,
                multiCoreTime,
                singleCoreOperations: SINGLE_CORE_OPERATIONS,
                multiCoreOperations: MULTI_CORE_OPERATIONS,
                processor: cpuInfo.manufacturer + " " + cpuInfo.brand,
                processorCores: cpuInfo.cores,
            });

            rank = response.data.rank;
        } catch (error) {
            console.error(
                "An error occurred while sending score:",
                error.response?.data?.message || error.message
            );
        }

        const singleCoreTimeInSec = singleCoreTime / 1e9;
        const multiCoreTimeInSec = multiCoreTime / 1e9;
        const consoleResult = {
            "Overall Score": overallScore.toFixed(3),
            ...(rank ? { "Your Rank": rank } : {}),
            "Single Core Score": singleCoreScore.toFixed(3),
            "Multi Core Score": multiCoreScore.toFixed(3),
            "Single Core Time": singleCoreTimeInSec.toFixed(3) + "s",
            "Multi Core Time": multiCoreTimeInSec.toFixed(3) + "s",
            Processor: cpuInfo.manufacturer + " " + cpuInfo.brand,
            Cores: cpuInfo.cores,
        };

        console.log("\x1B[A\x1B[K\nFinal Result");
        console.table(consoleResult);

        // input any key to exit
        await askAsync("\nPress enter key to exit...");
    } catch (error) {
        console.error("An error occurred:", error);
    }
};

main();
