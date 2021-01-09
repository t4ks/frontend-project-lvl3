/* eslint-disable no-param-reassign */
import getFormValidationSchema from './form-validation';
import makeRequest from './requester';
import parseFeed from './rss-feed-parser';

const addNewFeed = (feed, state) => {
  state.form.state = state.feeds.length === 0 ? 'initing-table' : '';
  state.feeds.push({ rssUrl: state.form.fields.url.value, ...feed.feed });
  state.items.push(...feed.items);
};

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
          state.form.status = 'parsing';
          const parsedFeed = parseFeed(response.data);
          addNewFeed(parsedFeed, state);
          state.form.status = 'adding';
          state.showedItemsIds.push(...parsedFeed.items.map((i) => i.id));
          state.form.status = 'added';
        })
        .catch((err) => {
          state.error = err.message;
          state.state = 'error';
        });
    })
    .catch((err) => {
      state.form.fields.url.error = err.message;
    });
};

export { handleRssFieldChange, handleSubmitForm };
