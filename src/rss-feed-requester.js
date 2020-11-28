import * as yup from 'yup';
import axios from 'axios';

const corsProxy = 'https://api.allorigins.win/raw?url=';

const getRssFeed = (url) => axios
  .get(`${corsProxy}${url}`)
  .catch(() => Promise.reject(new yup.ValidationError('Network error')));

export default getRssFeed;
