const { parentPort, workerData } = require("worker_threads");

let progressInterval = workerData.operationsPerCore / 100;

for (let i = 0; i < workerData.operationsPerCore; i++) {
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    let sum = num1 + num2;

    if (i % progressInterval === 0) {
        parentPort.postMessage({
            progressUpdate: ((i / workerData.operationsPerCore) * 100).toFixed(
                0
            ),
        });
    }
}
parentPort.postMessage(true);
