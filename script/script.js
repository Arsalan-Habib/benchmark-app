const os = require("os");
const {
    Worker,
    isMainThread,
    parentPort,
    workerData,
} = require("worker_threads");
const readline = require("readline");
const https = require("https");

const SINGLE_CORE_COUNT = 100_000_000_000;
const MULTI_CORE_COUNT = 1_000_000_000_000;

const hostname = "e44d-202-47-34-179.ngrok-free.app";

// Wrapping readline.question to use it with async/await
const questionAsync = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close();
            // printing an empty line to make the output look better.
            console.log("");
            resolve(ans);
        })
    );
};

// Function to hit score api endpoint
const sendScoreUpdate = async (username, score) => {
    const data = JSON.stringify({ username, score });

    const options = {
        hostname: hostname,
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

function singleCoreTest() {
    console.log("Running Single Core Test...");
    console.time("SingleCoreTest");

    const hrStartTime = process.hrtime();

    let progressInterval = SINGLE_CORE_COUNT / 100; // for updating progress every 1%

    for (let i = 0; i < SINGLE_CORE_COUNT; i++) {
        let num1 = Math.floor(Math.random() * 10) + 1;
        let num2 = Math.floor(Math.random() * 10) + 1;

        // no use for this, just to make sure the operation happens.
        let sum = num1 + num2;
        if (i % progressInterval === 0) {
            process.stdout.write(
                `Single Core Test Progress: ${(
                    (i / SINGLE_CORE_COUNT) *
                    100
                ).toFixed(0)}% \r`
            );
        }
    }
    // Clear the line once done
    process.stdout.write("".padEnd(50, " ") + "\r");

    const end = process.hrtime(hrStartTime);
    console.timeEnd("SingleCoreTest");

    // returning the total time taken in nanoseconds.
    return end[0] * 1e9 + end[1];
}

async function multiCoreTest() {
    console.log("\nRunning Multi-Core Test...");
    const numCores = os.cpus().length;
    const operationsPerCore = MULTI_CORE_COUNT / numCores;
    let workers = [];
    let overallProgress = new Array(numCores).fill(0);

    console.time("MultiCoreTest");
    const hrStartTime = process.hrtime();

    for (let i = 0; i < numCores; i++) {
        workers.push(
            new Promise((resolve, reject) => {
                const worker = new Worker(__filename, {
                    workerData: { operationsPerCore },
                });
                worker.on("message", (message) => {
                    if (message.progressUpdate) {
                        overallProgress[i] = parseFloat(message.progressUpdate);
                        let totalProgress =
                            overallProgress.reduce(
                                (acc, curr) => acc + curr,
                                0
                            ) / numCores;
                        process.stdout.write(
                            `Multi-Core Test Overall Progress: ${totalProgress.toFixed(
                                0
                            )}% \r`
                        );
                    } else if (typeof message === "number") {
                        resolve(message);
                    }
                });
                worker.on("error", reject);
                worker.on("exit", (code) => {
                    if (code !== 0)
                        reject(
                            new Error(`Worker stopped with exit code ${code}`)
                        );
                });
            })
        );
    }

    return Promise.all(workers)
        .then((results) => {
            // Clear the line once done
            process.stdout.write("".padEnd(50, " ") + "\r");

            console.timeEnd("MultiCoreTest");
            const end = process.hrtime(hrStartTime);

            // returning the total time taken in nanoseconds.
            return end[0] * 1e9 + end[1];
        })
        .catch((err) => {
            console.error("\nAn error occurred:", err);
            console.timeEnd("MultiCoreTest");
        });
}

function calculateFinalScore(singleTestScore, multiTestScore) {
    return (singleTestScore + multiTestScore) / 2;
}

// worker thread code.
if (!isMainThread) {
    let count = 0;
    let progressInterval = workerData.operationsPerCore / 100;

    for (let i = 0; i < workerData.operationsPerCore; i++) {
        let num1 = Math.floor(Math.random() * 10) + 1;
        let num2 = Math.floor(Math.random() * 10) + 1;
        count += num1 + num2;

        if (i % progressInterval === 0) {
            parentPort.postMessage({
                progressUpdate: (
                    (i / workerData.operationsPerCore) *
                    100
                ).toFixed(0),
            });
        }
    }
    parentPort.postMessage(count);
}

function printScoresAsTable(data) {
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

// Main execution function using async/await
const main = async () => {
    try {
        console.log("Welcome to the Dechains computing benchmark test!\n");

        const username = await questionAsync("Please enter your username: ");
        const singleCoreScore = singleCoreTest();
        const multiCoreScore = await multiCoreTest();

        // const finalScore = calculateFinalScore(singleTestScore, multiTestScore); // Implement your scoring logic

        const response = await sendScoreUpdate(username, {
            singleCoreScore,
            multiCoreScore,
        });
        // console.log(response);

        printScoresAsTable(JSON.parse(response).data);

        // input any key to exit
        await questionAsync("\nPress enter key to exit...");
    } catch (error) {
        console.error("An error occurred:", error);
    }
};

if (isMainThread) {
    main();
}
