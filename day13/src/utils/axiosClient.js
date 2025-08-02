import axios from "axios"

const axiosClient = axios.create({
    baseURL:'hhtp://localhost:3000',
    withCredentials:true,
    headers:{
        'content-type':'application/json'

    }
});

export default axiosClient;