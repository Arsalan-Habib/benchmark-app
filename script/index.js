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
const si = require("systeminformation");

// Main execution function using async/await
const main = async () => {
    try {
        console.log("\nWelcome to the Dechains computing benchmark test!");

        const username = await askAsync("\nPlease enter your username: ", true);
        console.log(`\x1B[A\x1B[KUsername: ${username}`);

        console.log("\nGetting system information...");
        const cpuInfo = await si.cpu();
        // clearing the log in the above line and then new success msg, after getting cpuinfo.
        console.log("\x1B[A\x1B[K✅ System Information");

        // console.time("SingleCoreTest");
        const singleCoreTime = singleCoreTest(SINGLE_CORE_OPERATIONS);
        // console.timeEnd("SingleCoreTest");
        console.log("\r✅ Single Core Test");

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

        const strippedCpuInfo = {
            processor: cpuInfo.manufacturer + " " + cpuInfo.brand,
            cores: cpuInfo.cores,
        };

        console.log("CPU Information:");
        console.table(strippedCpuInfo);

        const response = await sendScoreUpdate(username, {
            finalScore,
            singleCoreTime,
            multiCoreTime,
            singleCoreOperations: SINGLE_CORE_OPERATIONS,
            multiCoreOperations: MULTI_CORE_OPERATIONS,
            cpuInfo: cpuInfo,
        });

        // printScoreTable(JSON.parse(response).data);

        // input any key to exit
        await askAsync("\nPress enter key to exit...");
    } catch (error) {
        console.error("An error occurred:", error);
    }
};

main();
