const mongoose = require("mongoose");

const benchmarkSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true,
    },
    overallScore: {
        type: Number,
        required: true,
        index: true,
    },
    singleCoreScore: {
        type: Number,
        required: true,
    },
    multiCoreScore: {
        type: Number,
        required: true,
    },
    singleCoreTime: {
        type: Number,
        required: true,
    },
    multiCoreTime: {
        type: Number,
        required: true,
    },
    singleCoreOperations: {
        type: Number,
        required: true,
    },
    multiCoreOperations: {
        type: Number,
        required: true,
    },
    processor: {
        type: String,
    },
    processorCores: {
        type: Number,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Benchmark = mongoose.model("Benchmark", benchmarkSchema);

const getLeaderboard = async () => {
    const leaderboard = await Benchmark.find({}, { _id: 0, __v: 0 }).sort({
        overallScore: -1,
    });

    return leaderboard;
};

const addBenchmark = async (benchmark) => {
    const newBenchmark = new Benchmark(benchmark);
    return await newBenchmark.save();
};

const getRank = async (score) => {
    const leaderboard = await getLeaderboard();

    const rank = leaderboard.findIndex(
        (benchmark) => benchmark.overallScore < score
    );

    return rank;
};

module.exports = {
    Benchmark,
    getLeaderboard,
    addBenchmark,
    getRank,
};
