/* eslint-disable no-param-reassign */
import getFormValidationSchema from './form-validation';
import makeRequest from './requester';
import parseFeed from './rss-feed-parser';

const handleRssFieldChange = (state) => (e) => {
  state.form.fields.url.value = e.target.value;
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
          state.state = 'parsing';
          const parsedFeed = parseFeed(response.data);
          state.state = state.feeds.length === 0 ? 'initing-table' : '';
          state.feeds.push({ rssUrl: state.form.fields.url.value, ...parsedFeed.feed });
          state.items.push(...parsedFeed.items);
          state.state = 'adding';
          state.showedItemsIds.push(...parsedFeed.items.map((i) => i.id));
          state.state = 'added';
          state.form.status = 'idle';
        })
        .catch((err) => {
          state.error = err.message;
          state.state = 'error';
        });
    })
    .catch((err) => {
      state.form.fields.url.error = err.message;
      state.form.status = 'error';
    });
};

export { handleRssFieldChange, handleSubmitForm };
