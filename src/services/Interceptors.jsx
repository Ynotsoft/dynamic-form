import axios from 'axios';
import toast from 'react-hot-toast';
import {config} from '../config';
const apiClient = axios.create({
    baseURL: config.REACT_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response && error.response.status === 403) {
        toast.error( 'You are not authorized to access this resource.');
        return Promise.reject('You are not authorized to access this resource.');
      }else if (error.response) {
        toast.error( 'An error occurred' );
        return Promise.reject(error.response.data?.message || 'An error occurred');
      } else{
        toast.error(error.message);
      }
      

    }
  );
  export default apiClient;