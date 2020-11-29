import axios from 'axios';

const corsProxy = 'https://api.allorigins.win/raw?url=';

const getRssFeed = (url) => axios
  .get(`${corsProxy}${url}`)
  .catch(() => Promise.reject(new Error('Network error')));

export default getRssFeed;
