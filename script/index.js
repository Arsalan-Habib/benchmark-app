const {
    askAsync,
    printScoreTable,
    calculateFinalScore,
    sendScoreUpdate,
} = require("./utils");
const { singleCoreTest, multiCoreTest } = require("./coreTests");
const {
    SINGLE_CORE_OPERATIONS,
    MULTI_CORE_OPERATIONS,
} = require("./parameters");

// Main execution function using async/await
const main = async () => {
    try {
        console.log("\nWelcome to the Dechains computing benchmark test!\n");

        const username = await askAsync("Please enter your username: ", true);

        console.log("\nRunning Single Core Test...");
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

        console.log(`\nYour final score is: ${finalScore.toFixed(3)}`);

        // const response = await sendScoreUpdate(username, {
        //     finalScore,
        //     singleCoreTime,
        //     multiCoreTime,
        //     singleCoreOperations: SINGLE_CORE_OPERATIONS,
        //     multiCoreOperations: MULTI_CORE_OPERATIONS,
        // });

        // printScoreTable(JSON.parse(response).data);

        // input any key to exit
        await askAsync("\nPress enter key to exit...");
    } catch (error) {
        console.error("An error occurred:", error);
    }
};

main();
