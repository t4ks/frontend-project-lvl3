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
  getFormValidationSchema(state)
    .validate({ rssUrl: state.form.data.url })
    .then(() => getRssFeed(state.form.data.url))
    .then((response) => parseFeed(response.data))
    .then((parsedFeed) => {
      state.feeds.push({ rssUrl: state.form.data.url, ...parsedFeed.feed });
      state.items.push(...parsedFeed.items);
    })
    .catch((err) => {
      state.errors = err.errors;
    });
};

export { handleRssFieldChange, handleSubmitForm };
