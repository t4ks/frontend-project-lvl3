/* eslint-disable no-param-reassign */
import getFormValidationSchema from './form-validation';
import makeRequest from './requester';
import parseFeed from './rss-feed-parser';

const handleRssFieldChange = (state) => (e) => {
  state.form.status = 'filling';
  state.form.fields.url = {
    value: e.target.value,
    error: null,
  };
};

const handleSubmitForm = (state) => (e) => {
  e.preventDefault();
  getFormValidationSchema(state.feeds)
    .validate({ rssUrl: state.form.fields.url.value })
    .then(() => {
      state.form.status = 'downloading';
      makeRequest(state.form.fields.url.value)
        .then((response) => {
          state.form.fields.url.error = '';
          const parsedFeed = parseFeed(response.data);
          state.state = state.feeds.length === 0 ? 'initing' : 'idle';
          state.feeds.push({ rssUrl: state.form.fields.url.value, ...parsedFeed.feed });
          state.items.push(...parsedFeed.items);
          state.state = 'adding';
          state.showedItemsIds.push(...parsedFeed.items.map((i) => i.id));
        })
        .catch((err) => {
          state.error = err.message;
          state.state = 'error';
        });
      state.form.status = 'filling';
      state.state = 'idle';
    })
    .catch((err) => {
      const val = state.form.fields.url.value;
      state.form.fields.url = {
        error: err.message,
        value: val,
      };
      state.form.status = 'error';
    });
};

export { handleRssFieldChange, handleSubmitForm };
