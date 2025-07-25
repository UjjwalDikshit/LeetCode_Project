const {getLanguageById,submitBatch} = require('../utils/problemUtility');

const createProblem = async ( req, res)=>{
    
    const {title,description,difficulty,tags,
        visibleTestCases,hiddenTestCases,startCode, // check khi yaha toh error nhi aaya
        referenceSolution, problemCreator
    } = req.body;

    try{

        for(const { language,completeCode} of referenceSolution){

            const languageId = getLanguageById(language);

            // creating batch for submission
            const submissions = visibleTestCases.map(({input,output},index)=>({
                source_code:completeCode,
                language_id: languageId,
                stdin: input,
                expected_output: output
            }));

            const submitResult = await submitBatch(submissions);
            
        }
    }
    catch(err){

    }
}


// const submissions = [
//     {
//       "language_id": 46,
//       "source_code": "echo hello from Bash",
//       stdin:23,
//       expected_output:43,
//     },
//     {
//       "language_id": 123456789,
//       "source_code": "print(\"hello from Python\")"
//     },
//     {
//       "language_id": 72,
//       "source_code": ""
//     }
//   ]


// [
//   {
//     "token": "db54881d-bcf5-4c7b-a2e3-d33fe7e25de7"
//   },
//   {
//     "token": "ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1"
//   },
//   {
//     "token": "1b35ec3b-5776-48ef-b646-d5522bdeb2cc"
//   }
// ]

