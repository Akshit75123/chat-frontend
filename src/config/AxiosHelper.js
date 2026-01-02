import axios from "axios";

export const baseURL = "https://chatapp-backend-ykvk.onrender.com/";

export const httpClient = axios.create({
    baseURL:baseURL,
});