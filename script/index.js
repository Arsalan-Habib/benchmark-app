const { askAsync, printScoreTable } = require("./utils");
const { singleCoreTest, multiCoreTest } = require("./coreTests");

const SINGLE_CORE_OPERATIONS = 100_000_000;
const MULTI_CORE_OPERATIONS = 800_000_000;

// Main execution function using async/await
const main = async () => {
    try {
        console.log("Welcome to the Dechains computing benchmark test!\n");

        const username = await askAsync("Please enter your username: ", true);

        console.log("Running Single Core Test...");
        console.time("SingleCoreTest");
        const singleCoreTime = singleCoreTest(SINGLE_CORE_OPERATIONS);
        console.timeEnd("SingleCoreTest");

        console.log("\nRunning Multi-Core Test...");
        console.time("MultiCoreTest");
        const multiCoreTime = await multiCoreTest(MULTI_CORE_OPERATIONS);
        console.timeEnd("MultiCoreTest");

        const finalScore = calculateFinalScore(
            singleCoreTime,
            multiCoreTime,
            SINGLE_CORE_OPERATIONS,
            MULTI_CORE_OPERATIONS
        );

        const response = await sendScoreUpdate(username, {
            singleCoreScore,
            multiCoreScore,
        });

        printScoreTable(JSON.parse(response).data);

        // input any key to exit
        await askAsync("\nPress enter key to exit...");
    } catch (error) {
        console.error("An error occurred:", error);
    }
};

main();
