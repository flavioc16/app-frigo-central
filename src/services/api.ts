import axios from "axios";

const apiUrl = 'https://backend-api-beta-inky.vercel.app/';

//http://192.168.0.2:3333
if (!apiUrl) {
  throw new Error('API URL is not defined in app config');
}

const api = axios.create({
  baseURL: apiUrl
});

export { api };
