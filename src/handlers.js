/* eslint-disable no-param-reassign */
import getFormValidationSchema from './form-validation';
import makeRequest from './rss-feed-requester';
import {
  markFormStateAsError,
  markFormStateAsAwaitig,
  makrFormStateAsDownloading,
  makrFormStateAsParsing,
  makrFormStateAsAdding,
  markFormStateAsAdded,
  normalizeFeed,
} from './utils';

const addNewFeed = (feed, state) => {
  state.form.state = state.feeds.length === 0 ? 'initing-table' : '';
  state.feeds.push({ rssUrl: state.form.data.url, ...feed.feed });
  state.items.push(...feed.items);
};

const handleRssFieldChange = (state) => (e) => {
  state.form.data.url = e.target.value;
};

const handleSubmitForm = (state) => (e) => {
  e.preventDefault();
  markFormStateAsAwaitig(state);
  getFormValidationSchema(state)
    .validate({ rssUrl: state.form.data.url })
    .then(() => {
      makrFormStateAsDownloading(state);
      return makeRequest(state.form.data.url);
    })
    .then((response) => {
      makrFormStateAsParsing(state);
      return normalizeFeed(response.data);
    })
    .then((parsedFeed) => {
      addNewFeed(parsedFeed, state);
      makrFormStateAsAdding(state);
      state.showedItemsIds.push(...parsedFeed.items.map((i) => i.id));
      markFormStateAsAdded(state);
    })
    .catch((err) => {
      if (err.isAxiosError === true) {
        return markFormStateAsError({ state, err: { message: ['Network error'] } });
      }
      return markFormStateAsError({ state, err });
    });
};

export { handleRssFieldChange, handleSubmitForm };
