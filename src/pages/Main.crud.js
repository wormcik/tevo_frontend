import axios from 'axios';

const API_BASE_CLIENT = `${process.env.REACT_APP_API_URL}/api/v1/tevo-service/Client`;

export const clientGet = () => axios.get(`${API_BASE_CLIENT}/GetAll`);
export const clientAdd = (item) => axios.post(`${API_BASE_CLIENT}/Add`, item);
export const clientDelete = (id) => axios.delete(`${API_BASE_CLIENT}/Delete/${id}`);
export const clientUpdate = (item) => axios.put(`${API_BASE_CLIENT}/Update`, item);
