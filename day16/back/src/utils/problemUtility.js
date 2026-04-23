// const axios = require('axios');


// const getLanguageById = (lang)=>{

//     const language = {
//         "c++":54,
//         "java":62,
//         "javascript":63
//     }


//     return language[lang.toLowerCase()];
// }


// const submitBatch = async (submissions)=>{


// const options = {
//   method: 'POST',
//   url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//   params: {
//     base64_encoded: 'false'
//   },
//   headers: {
//     'x-rapidapi-key': process.env.JUDGE0_KEY,
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
//     'Content-Type': 'application/json'
//   },
//   data: {
//     submissions
//   }
// };

// async function fetchData() {
// 	try {
// 		const response = await axios.request(options);
// 		return response.data;
// 	} catch (error) {
// 		console.error(error);
// 	}
// }

//  return await fetchData();

// }


// const waiting = async(timer)=>{
//   setTimeout(()=>{
//     return 1;
//   },timer);
// }

// // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

// const submitToken = async(resultToken)=>{

// const options = {
//   method: 'GET',
//   url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//   params: {
//     tokens: resultToken.join(","),
//     base64_encoded: 'false',
//     fields: '*'
//   },
//   headers: {
//     'x-rapidapi-key': process.env.JUDGE0_KEY,
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
//   }
// };

// async function fetchData() {
// 	try {
// 		const response = await axios.request(options);
// 		return response.data;
// 	} catch (error) {
// 		console.error(error);
// 	}
// }


//  while(true){

//  const result =  await fetchData();

//   const IsResultObtained =  result.submissions.every((r)=>r.status_id>2);

//   if(IsResultObtained)
//     return result.submissions;

  
//   await waiting(1000);
// }



// }


// module.exports = {getLanguageById,submitBatch,submitToken};




const axios = require("axios");

//  Language Mapping
const getLanguageById = (lang) => {
  const language = {
    "c++": 54,
    "java": 62,
    "javascript": 63,
  };

  const id = language[lang.toLowerCase()];
  if (!id) throw new Error(`Unsupported language: ${lang}`);

  return id;
};

//  Submit Batch
const submitBatch = async (submissions) => {
  try {
    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions/batch",
      { submissions },
      {
        params: { base64_encoded: "false" },
        headers: {
          "x-rapidapi-key": process.env.JUDGE0_KEY,
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("SubmitBatch Error:", error.response?.data || error.message);
    throw new Error("Judge0 submission failed");
  }
};

//  Proper Sleep Function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//  Get Result from Tokens (Polling)
const submitToken = async (tokens) => {
  try {
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    while (attempts < MAX_ATTEMPTS) {
      const response = await axios.get(
        "https://judge0-ce.p.rapidapi.com/submissions/batch",
        {
          params: {
            tokens: tokens.join(","),
            base64_encoded: "false",
            fields: "*",
          },
          headers: {
            "x-rapidapi-key": process.env.JUDGE0_KEY,
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          },
        }
      );

      const results = response.data.submissions;

      const allDone = results.every(
        (r) => r.status && r.status.id > 2
      );

      if (allDone) return results;

      attempts++;
      await sleep(1000);
    }

    throw new Error("Judge0 timeout: Results not ready");
  } catch (error) {
    console.error("SubmitToken Error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { getLanguageById, submitBatch, submitToken };


