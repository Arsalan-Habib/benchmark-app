// Number of operations to perform for single core.
const SINGLE_CORE_OPERATIONS = 200_000_000;

// Number of operations to perform for multi core. This will be divided by the number of cores available multiplied by the number of threads per core.
const MULTI_CORE_OPERATIONS = 2_000_000_000;

// Number of threads to create per core.
const THREADS_PER_CORE = 1;

// The weight of the multi core test compared to the single core test. This is used to calculate the final score. (1 = equal weight, 2 = double weight, etc.)
const MULTI_CORE_WEIGHT = 1.5;

// Division factor for the final score. Used to divide the result of the combined score to normalize it to a smaller number.
const DIVISION_FACTOR = 1_000_000;

module.exports = {
    SINGLE_CORE_OPERATIONS,
    MULTI_CORE_OPERATIONS,
    THREADS_PER_CORE,
    MULTI_CORE_WEIGHT,
    DIVISION_FACTOR,
};
