/* eslint-disable no-param-reassign */
import getFormValidationSchema from './form-validation';
import parseFeed from './rss-feed-parser';
import getRssFeed from './rss-feed-requester';

const handleRssFieldChange = (state) => (e) => {
  state.form.data.url = e.target.value;
};

const handleSubmitForm = (state) => (e) => {
  e.preventDefault();
  state.errors = [];
  state.form.state = 'valid';
  getFormValidationSchema(state)
    .validate({ rssUrl: state.form.data.url })
    .then(() => getRssFeed(state.form.data.url))
    .then((response) => parseFeed(response.data))
    .then((parsedFeed) => {
      state.form.state = state.feeds.length === 0 ? 'initing-table' : '';
      state.feeds.push({ rssUrl: state.form.data.url, ...parsedFeed.feed });
      const newItems = [...parsedFeed.items];
      state.items.push(...newItems);
      state.newItems = newItems;
      state.form.state = 'adding';
      state.newItems = [];
      state.form.state = 'added';
    })
    .catch((err) => {
      state.errors = [{ message: err.message }];
      state.form.state = 'error';
    });
};

export { handleRssFieldChange, handleSubmitForm };
