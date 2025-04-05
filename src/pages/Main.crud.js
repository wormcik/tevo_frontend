import axios from 'axios';

const API_BASE_TEST = `${process.env.REACT_APP_API_URL}/api/v1/tevo-service/Test`;

export const testGet = () => axios.get(`${API_BASE_TEST}/GetAll`);
export const testAdd = (item) => axios.post(`${API_BASE_TEST}/Add`, item);
export const testDelete = (id) => axios.delete(`${API_BASE_TEST}/Delete/${id}`);
export const testUpdate = (item) => axios.put(`${API_BASE_TEST}/Update`, item);
