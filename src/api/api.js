import axios from 'axios';

let base = '';

export const requestLogin = params => { return axios.post(`${base}/login`, params).then(res => res.data); };

export const getUserList = params => { return axios.get(`${base}/user/list`, { params: params }); };

export const getUserListPage = params => { return axios.get(`${base}/task/list`, { params: params }); };

export const removeUser = params => { return axios.get(`${base}/user/remove`, { params: params }); };

export const batchRemoveUser = params => { return axios.get(`${base}/user/batchremove`, { params: params }); };

export const editTask = params => { return axios.post(`${base}/task/update`, params); };

export const addTask = params => { return axios.post(`${base}/task/add`, params); };

export const enableTask= params => { return axios.get(`${base}/task/cron/${params}`); };

export const cronTime= params => { return axios.get(`${base}/help/cronTime`,{ params: params }); };
