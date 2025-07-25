

const axios = require('axios');

const getLanguageById = (lang)=>{
    const language = {
        "c++":54,
        "java":62,
        "javascript":63
    }

    return language[language.toLowerCase()];
}

const submitBatch = async (submissions) => {
    const options = {
        method: 'POST',
        url: 'https://judge0-extra-ce.p.rapidapi.com/submissions/batch',
        params: {
            base64_encoded: 'true'
        },
        headers: {
            'x-rapidapi-key': 'a84c7eaff2msh0fde75bd044269ep113f51jsn4649573b0658',
            'x-rapidapi-host': 'judge0-extra-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            submissions
        }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            return Response.data;
        } catch (error) {
            console.error(error);
        }
    }

    return fetchData();

}

module.exports = {getLanguageById,submitBatch};