/* eslint-disable no-param-reassign */
import getFormValidationSchema from './form-validation';
import parseFeed from './rss-feed-parser';
import getRssFeed from './rss-feed-requester';
import { markFormStateAsError, markFormStateAsValid } from './utils';

const handleRssFieldChange = (state) => (e) => {
  state.form.data.url = e.target.value;
};

const handleSubmitForm = (state) => (e) => {
  e.preventDefault();
  markFormStateAsValid(state);
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
      markFormStateAsError({ state, err });
    });
};

export { handleRssFieldChange, handleSubmitForm };
