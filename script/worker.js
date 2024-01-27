const { parentPort, workerData } = require("worker_threads");

let progressInterval = workerData.operationsPerThread / 100;

const hrStartTime = process.hrtime();

for (let i = 0; i < workerData.operationsPerThread; i++) {
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    let sum = num1 + num2;

    if (i % progressInterval === 0) {
        parentPort.postMessage({
            progressUpdate: (
                (i / workerData.operationsPerThread) *
                100
            ).toFixed(0),
        });
    }
}
const end = process.hrtime(hrStartTime);

// returning the total time taken in nanoseconds.
const totalTime = end[0] * 1e9 + end[1];

parentPort.postMessage(totalTime);
