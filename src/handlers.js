/* eslint-disable no-param-reassign */
import getFormValidationSchema from './form-validation';
import makeRequest from './requester';
import parseFeed from './rss-feed-parser';

const handleRssFieldChange = (state) => (e) => {
  state.form.fields.url = {
    value: e.target.value,
    error: null,
  };
};

const handleSubmitForm = (state) => (e) => {
  e.preventDefault();
  state.form.status = 'validating';
  getFormValidationSchema(state.feeds)
    .validate({ rssUrl: state.form.fields.url.value })
    .then(() => {
      state.form.status = 'validated';
      state.form.fields.url.error = null;
      state.form.status = 'loading';
      makeRequest(state.form.fields.url.value)
        .then((response) => {
          const parsedFeed = parseFeed(response.data);
          state.state = state.feeds.length === 0 ? 'initing' : 'idle';
          state.feeds.push({ rssUrl: state.form.fields.url.value, ...parsedFeed.feed });
          state.items.push(...parsedFeed.items);
          state.form.status = 'succeeded';
          state.showedItemsIds.push(...parsedFeed.items.map((i) => i.id));
        })
        .catch((err) => {
          state.error = err.message;
          state.form.status = 'failed';
        });
      state.form.status = 'idle';
    })
    .catch((err) => {
      const val = state.form.fields.url.value;
      state.form.fields.url = {
        error: err.message,
        value: val,
      };
      state.form.status = 'invalid';
    });
};

export { handleRssFieldChange, handleSubmitForm };
