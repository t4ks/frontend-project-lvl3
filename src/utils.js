/* eslint-disable no-param-reassign */
import parseFeed from './rss-feed-parser';

const markFormStateAsAwaitig = (state) => {
  state.errors = [];
  state.form.state = 'awaiting';
};

const markFormStateAsError = ({ state, err, params = {} }) => {
  state.errors = [{ message: err.message, params }];
  state.form.state = 'error';
};

const makrFormStateAsDownloading = (state) => {
  state.form.feedback = ['RSS feed is downloading...'];
  state.form.state = 'downloading';
};

const makrFormStateAsParsing = (state) => {
  state.form.feedback = [{ message: 'RSS feed is parsing...' }];
  state.form.state = 'parsing';
};

const makrFormStateAsAdding = (state) => {
  state.form.feedback = [{ message: 'RSS feed is adding...' }];
  state.form.state = 'adding';
};

const markFormStateAsAdded = (state) => {
  state.form.feedback = [{ message: 'The RSS feed has been added' }];
  state.form.state = 'added';
};

const normalizeFeed = (rawFeed) => {
  try {
    return Promise.resolve(parseFeed(rawFeed));
  } catch {
    return Promise.reject(new Error('Invalid RSS format'));
  }
};

export {
  markFormStateAsAwaitig,
  markFormStateAsError,
  makrFormStateAsDownloading,
  makrFormStateAsParsing,
  makrFormStateAsAdding,
  markFormStateAsAdded,
  normalizeFeed,
};
