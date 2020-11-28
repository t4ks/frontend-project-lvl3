import * as yup from 'yup';
import _ from 'lodash';

export default (data) => {
  const domparser = new DOMParser();
  const feedId = _.uniqueId();
  try {
    const xmlDoc = domparser.parseFromString(data, 'application/xml');
    const channel = xmlDoc.querySelector('channel');
    const posts = xmlDoc.querySelector('channel').querySelectorAll('item');
    return Promise.resolve({
      feed: {
        id: feedId,
        name: channel.querySelector('title').textContent,
        description: channel.querySelector('description').textContent,
      },
      items: Array.from(posts).map((item) => {
        const title = item.querySelector('title').textContent;
        const url = item.querySelector('link').textContent;
        return {
          id: `${title}:${url}`, name: title, url, feedId,
        };
      }),
    });
  } catch {
    return Promise.reject(new yup.ValidationError('Invalid RSS format'));
  }
};
