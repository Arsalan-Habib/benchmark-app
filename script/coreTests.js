const os = require("os");
const path = require("path");
const { Worker } = require("worker_threads");
const { THREADS_PER_CORE } = require("./parameters");

function singleCoreTest(totalOperations) {
    const hrStartTime = process.hrtime();

    console.log("\nRunning Single Core Test...");

    let progressInterval = totalOperations / 100; // for updating progress every 1% of the total operations.

    for (let i = 0; i < totalOperations; i++) {
        let num1 = Math.floor(Math.random() * 10) + 1;
        let num2 = Math.floor(Math.random() * 10) + 1;

        // no use for this, just to make sure the operation happens.
        let sum = num1 + num2;
        if (i % progressInterval === 0) {
            process.stdout.write(
                `\rSingle Core Test Progress: ${(
                    (i / totalOperations) *
                    100
                ).toFixed(0)}% `
            );
        }
    }

    // Clear current line, then move cursor up one line and clear that line.
    // \x1B[A is an ANSI escape code that moves the cursor up one line.
    // \x1B[K clears the line where the cursor currently is.
    process.stdout.write("\r\x1B[K\x1B[A\x1B[K");

    const end = process.hrtime(hrStartTime);

    // returning the total time taken in nanoseconds.
    return end[0] * 1e9 + end[1];
}

async function multiCoreTest(totalOperations) {
    const numCores = os.cpus().length;

    const threads = numCores * Math.floor(THREADS_PER_CORE);

    const operationsPerThread = totalOperations / threads;
    let workers = [];

    // to keep track of progress of each core.
    let overallProgress = new Array(threads).fill(0);

    console.log("\nRunning Multi-Core Test...");

    const hrStartTime = process.hrtime();

    for (let i = 0; i < threads; i++) {
        workers.push(
            new Promise((resolve, reject) => {
                // creating a new worker thread.
                const worker = new Worker(path.join(__dirname, "worker.js"), {
                    workerData: { operationsPerThread },
                });

                worker.on("message", (message) => {
                    if (message.progressUpdate) {
                        // updating the progress of the core.
                        overallProgress[i] = parseFloat(message.progressUpdate);

                        // calculating the overall progress.
                        let totalProgress =
                            overallProgress.reduce(
                                (acc, curr) => acc + curr,
                                0
                            ) / threads;

                        process.stdout.write(
                            `\rMulti-Core Test Overall Progress: ${totalProgress.toFixed(
                                0
                            )}% `
                        );
                    }

                    // if the message is a number, it means the worker has finished its task.
                    else if (typeof message === "number") {
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
            // Clear current line, then move cursor up one line and clear that line.
            // \x1B[A is an ANSI escape code that moves the cursor up one line.
            // \x1B[K clears the line where the cursor currently is.
            process.stdout.write("\r\x1B[K\x1B[A\x1B[K");

            const end = process.hrtime(hrStartTime);

            // returning the total time taken in nanoseconds.
            return end[0] * 1e9 + end[1];
        })
        .catch((err) => {
            console.error("\nAn error occurred:", err);
        });
}

module.exports = {
    singleCoreTest,
    multiCoreTest,
};
