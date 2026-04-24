const {
  getLanguageById,
  submitBatch,
  submitToken,
} = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");

const generateWrapper = (userCode, testcaseInput, functionName, language) => {
  const lines = testcaseInput.trim().split("\n");

  const nums = lines[1].split(" ").map(Number);
  const target = parseInt(lines[2]);

  //  JAVASCRIPT
  if (language === "javascript") {
    return `
${userCode}

const nums = ${JSON.stringify(nums)};
const target = ${target};

const result = ${functionName}(nums, target);

if (Array.isArray(result)) {
  console.log(result.join(" "));
} else {
  console.log(result);
}
`;
  }

  //  JAVA
  if (language === "java") {
    return `
import java.util.*;

${userCode}

public class Main {
  public static void main(String[] args) {
    int[] nums = new int[]{${nums.join(",")}};
    int target = ${target};

    Solution sol = new Solution();
    int result = sol.${functionName}(nums, target);

    System.out.println(result);
  }
}
`;
  }

  //  C++
  if (language === "c++") {
    return `
#include <bits/stdc++.h>
using namespace std;

${userCode}

int main() {
  vector<int> nums = {${nums.join(",")}};
  int target = ${target};

  Solution sol;
  int result = sol.${functionName}(nums, target);

  cout << result;

  return 0;
}
`;
  }

  throw new Error("Unsupported language");
};

const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
    functionName, //  NEW
  } = req.body;

  try {
    //  Validation
    if (!title || !description || !difficulty || !functionName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    //  Normalize tags
    let normalizedTags = [];
    if (typeof tags === "string") normalizedTags = [tags];
    else if (Array.isArray(tags)) normalizedTags = tags;

    //  Validate reference solution
    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      //  Function name check (important)
      if (!completeCode.includes(functionName)) {
        return res.status(400).json({
          success: false,
          message: `Function name mismatch in ${language}`,
        });
      }

      const submissions = visibleTestCases.map((testcase) => ({
        source_code: generateWrapper(
          completeCode,
          testcase.input,
          functionName,
          language,
        ),
        language_id: languageId,
        stdin: "",
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);
      const tokens = submitResult.map((res) => res.token);

      const results = await submitToken(tokens);

      for (const test of results) {
        if (test.status.id !== 3) {
          return res.status(400).json({
            success: false,
            message: "Reference solution failed",
            error: test.status.description,
          });
        }
      }
    }

    //  Save
    const problem = await Problem.create({
      title,
      description,
      difficulty,
      tags: normalizedTags,
      visibleTestCases,
      hiddenTestCases,
      startCode,
      referenceSolution,
      functionName,
      problemCreator: req.result._id,
    });

    res.status(201).json({
      success: true,
      message: "Problem created successfully",
      problem,
    });
  } catch (err) {
    console.error("CreateProblem Error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

const updateProblem = async (req, res) => {
  const { id } = req.params;

  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
    functionName,
  } = req.body;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing problem ID",
      });
    }

    const existingProblem = await Problem.findById(id);
    if (!existingProblem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    let normalizedTags = [];
    if (typeof tags === "string") normalizedTags = [tags];
    else if (Array.isArray(tags)) normalizedTags = tags;

    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      if (!completeCode.includes(functionName)) {
        return res.status(400).json({
          success: false,
          message: `Function name mismatch in ${language}`,
        });
      }

      const submissions = visibleTestCases.map((testcase) => ({
        source_code: generateWrapper(
          completeCode,
          testcase.input,
          functionName,
          language,
        ),
        language_id: languageId,
        stdin: "",
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);
      const tokens = submitResult.map((res) => res.token);

      const results = await submitToken(tokens);

      for (const test of results) {
        if (test.status.id !== 3) {
          return res.status(400).json({
            success: false,
            message: "Reference solution failed",
            error: test.status.description,
          });
        }
      }
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      {
        title,
        description,
        difficulty,
        tags: normalizedTags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        referenceSolution,
        functionName,
      },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      problem: updatedProblem,
    });
  } catch (err) {
    console.error("UpdateProblem Error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing problem ID",
      });
    }

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if (!deletedProblem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing problem ID",
      });
    }

    const problem = await Problem.findById(id).select(
      "_id title description difficulty tags visibleTestCases hiddenTestCases startCode referenceSolution functionName",
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    res.status(200).json({
      success: true,
      problem,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getAllProblem = async (req, res) => {
  try {
    const problems = await Problem.find({}).select("_id title difficulty tags");

    res.status(200).json({
      success: true,
      problems,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const solvedAllProblembyUser = async (req, res) => {
  try {
    const userId = req.result._id;

    const user = await User.findById(userId).populate({
      path: "problemSolved",
      select: "_id title difficulty tags",
    });

    res.status(200).json({
      success: true,
      solvedProblems: user.problemSolved,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const submittedProblem = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.pid;

    const submissions = await Submission.find({ userId, problemId });

    res.status(200).json({
      success: true,
      submissions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedAllProblembyUser,
  submittedProblem,
};
