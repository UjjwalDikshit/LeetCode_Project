const mongoose = require("mongoose");
const { Schema } = mongoose;

const problemSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    functionName: {
      type: String,
      required: true,
    },
    //  FIXED: multiple tags allowed
    tags: [
      {
        type: String,
        enum: [
          "array",
          "string",
          "linkedList",
          "stack",
          "queue",
          "heap",
          "priorityQueue",
          "hashTable",
          "hashSet",
          "hashMap",
          "tree",
          "binaryTree",
          "binarySearchTree",
          "trie",
          "graph",
          "dfs",
          "bfs",
          "topologicalSort",
          "shortestPath",
          "dijkstra",
          "floydWarshall",
          "unionFind",
          "disjointSet",
          "backtracking",
          "recursion",
          "divideAndConquer",
          "greedy",
          "dynamicProgramming",
          "dp",
          "bitManipulation",
          "math",
          "numberTheory",
          "combinatorics",
          "geometry",
          "slidingWindow",
          "twoPointers",
          "binarySearch",
          "sorting",
          "quickSort",
          "mergeSort",
          "countingSort",
          "radixSort",
          "bucketSort",
          "prefixSum",
          "suffixArray",
          "segmentTree",
          "fenwickTree",
          "bitmask",
          "gameTheory",
          "simulation",
          "design",
          "database",
          "concurrency",
          "memoization",
          "randomized",
          "matrix",
          "intervals",
          "monotonicStack",
          "monotonicQueue",
        ],
      },
    ],

    visibleTestCases: [
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
          default: "", // optional now
        },
      },
    ],

    hiddenTestCases: [
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
      },
    ],

    startCode: [
      {
        language: {
          type: String,
          required: true,
        },
        initialCode: {
          type: String,
          required: true,
        },
      },
    ],

    referenceSolution: [
      {
        language: {
          type: String,
          required: true,
        },
        completeCode: {
          type: String,
          required: true,
        },
      },
    ],

    problemCreator: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true, //  createdAt, updatedAt
  },
);

//  Index for faster search
problemSchema.index({ title: 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });

const Problem = mongoose.model("problem", problemSchema);

module.exports = Problem;
