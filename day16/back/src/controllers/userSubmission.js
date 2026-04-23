const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");


const generateWrapper = (userCode, testcaseInput) => {
  if (!testcaseInput || typeof testcaseInput !== "string") {
    throw new Error("Invalid testcase input");
  }

  const lines = testcaseInput.trim().split("\n");

  let nums = [];
  let target;

  // ✅ Case 1: Standard format (3 lines)
  if (lines.length >= 3) {
    nums = lines[1].split(" ").map(Number);
    target = parseInt(lines[2]);
  }
  // ✅ Case 2: Simple format (single line "2 3")
  else if (lines.length === 1) {
    nums = lines[0].split(" ").map(Number);
    target = nums.pop(); // last value = target
  }
  else {
    throw new Error(`Unsupported input format: ${testcaseInput}`);
  }

  return `
${userCode}

const nums = ${JSON.stringify(nums)};
const target = ${target};

const result = twoSum(nums, target);

if (Array.isArray(result)) {
  console.log(result.join(" "));
} else if (result !== undefined) {
  console.log(result);
} else {
  console.log("");
}
`;
};
// ================= SUBMIT CODE =================
const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    const { code, language } = req.body;

    
    if (!userId || !code || !problemId || !language) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    console.log("Testcases:", problem.visibleTestCases);

    //  Create submission entry
    const submission = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: "pending",
      testCasesTotal: problem.hiddenTestCases.length
    });

    const languageId = getLanguageById(language);

    //  Use WRAPPER (NO stdin)
    const submissions = problem.hiddenTestCases.map((tc) => ({
      source_code: generateWrapper(code, tc.input),
      language_id: languageId,
      stdin: "",
      expected_output: tc.output
    }));

    const submitResult = await submitBatch(submissions);
    const tokens = submitResult.map(r => r.token);
    const results = await submitToken(tokens);

    // ================= PROCESS RESULT =================
    let passed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errorMessage = "";

    for (const test of results) {
      if (test.status.id === 3) {
        passed++;
        runtime += parseFloat(test.time || 0);
        memory = Math.max(memory, test.memory || 0);
      } else {
        status = test.status.id === 4 ? "wrong" : "error";
        errorMessage = test.stderr || test.compile_output || test.message;
      }
    }

    // ✅ Update submission
    submission.status = status;
    submission.testCasesPassed = passed;
    submission.runtime = runtime;
    submission.memory = memory;
    submission.errorMessage = errorMessage;

    await submission.save();

    // ✅ Add solved problem if accepted
    if (status === "accepted") {
      const user = await User.findById(userId);
      if (!user.problemSolved.includes(problemId)) {
        user.problemSolved.push(problemId);
        await user.save();
      }
    }

    return res.status(200).json({
      accepted: status === "accepted",
      passedTestCases: passed,
      totalTestCases: problem.hiddenTestCases.length,
      runtime,
      memory,
      error: errorMessage
    });

  } catch (err) {
    console.error("Submit Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// ================= RUN CODE =================
const runCode = async (req, res) => {
  try {
    const problemId = req.params.id;
    const { code, language } = req.body;

    if (!code || !language || !problemId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const languageId = getLanguageById(language);

    // ✅ Use WRAPPER for visible testcases
    const submissions = problem.visibleTestCases.map((tc) => ({
      source_code: generateWrapper(code, tc.input),
      language_id: languageId,
      stdin: "",
      expected_output: tc.output
    }));

    const submitResult = await submitBatch(submissions);
    const tokens = submitResult.map(r => r.token);
    const results = await submitToken(tokens);

    // Format response for frontend
    const formatted = results.map((r, i) => ({
      stdin: problem.visibleTestCases[i].input,
      expected_output: problem.visibleTestCases[i].output,
      stdout: r.stdout,
      status_id: r.status.id
    }));

    return res.status(200).json({
      success: formatted.every(tc => tc.status_id === 3),
      testCases: formatted,
      runtime: results.reduce((acc, r) => acc + parseFloat(r.time || 0), 0),
      memory: Math.max(...results.map(r => r.memory || 0))
    });

  } catch (err) {
    console.error("Run Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = { submitCode, runCode };