import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;

const API_BASE_CLIENT = `${BASE_URL}/api/v1/tevo-service/Client`;
const API_BASE_AUTH = `${BASE_URL}/api/v1/tevo-service/Auth`;
const API_BASE_USER = `${BASE_URL}/api/v1/tevo-service/User`;
const API_BASE_DEMAND = `${BASE_URL}/api/v1/tevo-service/Demand`;
const API_BASE_PROFILE = `${BASE_URL}/api/v1/tevo-service/Profile`;
const API_BASE_PRODUCT = `${BASE_URL}/api/v1/tevo-service/Product`;

// 🔹 Client
export const clientGet = () => axios.get(`${API_BASE_CLIENT}/GetAll`);
export const clientAdd = (item) => axios.post(`${API_BASE_CLIENT}/Add`, item);
export const clientDelete = (id) =>
  axios.delete(`${API_BASE_CLIENT}/Delete/${id}`);
export const clientUpdate = (item) =>
  axios.put(`${API_BASE_CLIENT}/Update`, item);
export const clientFilter = (filters) => {
  const query = new URLSearchParams({
    name: filters.clientName || "",
    surname: filters.clientSurname || "",
    tel: filters.clientTelNo || "",
    adres: filters.clientAdres || "",
  }).toString();

  return axios.get(`${API_BASE_CLIENT}/Filter?${query}`);
};

// 🔹 Auth
export const logInUser = (payload) =>
  axios.post(`${API_BASE_AUTH}/LogIn`, payload);
export const signInUser = (payload) =>
  axios.post(`${API_BASE_AUTH}/SignIn`, payload);
export const checkUserAuth = (userId) =>
  axios.get(`${API_BASE_AUTH}/MenuPermission?userId=${userId}`);

// 🔹 User
export const getAllUsers = () => axios.get(`${API_BASE_USER}/GetAll`);
export const getAllBuyerUsers = () => axios.get(`${API_BASE_USER}/GetAllBuyer`);
export const banUser = (data) => axios.post(`${API_BASE_USER}/Ban`, data);

// 🔹 Buyer
export const createDemand = (payload) =>
  axios.post(`${API_BASE_DEMAND}/Create`, payload);
export const getMyDemands = (userId) =>
  axios.get(`${API_BASE_DEMAND}/GetByUser?userId=${userId}`);
export const approveDemand = (demandId) =>
  axios.post(`${API_BASE_DEMAND}/Approve`, { demandId });
export const cancelDemand = (demandId) =>
  axios.post(`${API_BASE_DEMAND}/Cancel`, { demandId });

// 🔹 Seller
export const getAllDemands = () => axios.get(`${API_BASE_DEMAND}/GetAll`);
export const getDemandsForSeller = (userId) =>
  axios.get(`${API_BASE_DEMAND}/GetForSeller?userId=${userId}`);
export const updateDemandBySeller = (payload) =>
  axios.put(`${API_BASE_DEMAND}/UpdateBySeller`, payload);
export const createManualDemand = (payload) =>
  axios.post(`${API_BASE_DEMAND}/AddManually`, payload);

// 🔹 Profile
export const getUserProfile = (userId) =>
  axios.get(`${API_BASE_PROFILE}/GetProfile?userId=${userId}`);
export const updateProfile = (data) =>
  axios.put(`${API_BASE_PROFILE}/UpdateProfile`, data);

// 🔹 Product
export const getAllProducts = () => axios.get(`${API_BASE_PRODUCT}/GetAll`);
export const addProduct = (data) => axios.post(`${API_BASE_PRODUCT}/Add`, data);
export const deleteProduct = (data) =>
  axios.post(`${API_BASE_PRODUCT}/Delete`, data);

