/* eslint-disable no-param-reassign */
import parseFeed from './rss-feed-parser';

const markFormStateAsAwaitig = (state) => {
  state.form.errors = [];
  state.form.state = 'awaiting';
};

const markGlobalStateAsUpdating = (state) => {
  state.errors = [];
  state.state = 'updating';
};

const markGlobalStateAsUpdated = (state) => {
  state.errors = [];
  state.state = 'updated';
};

const markFormStateAsError = ({ state, err, params = {} }) => {
  state.form.errors = [{ message: err.message, params }];
  state.form.state = 'error';
};

const markGlobalStateAsError = ({ state, err, params = {} }) => {
  state.errors = [{ message: err.message, params }];
  state.state = 'error';
};

const makrFormStateAsDownloading = (state) => {
  state.form.feedbacks = ['RSS feed is downloading...'];
  state.form.state = 'downloading';
};

const makrFormStateAsParsing = (state) => {
  state.form.feedbacks = [{ message: 'RSS feed is parsing...' }];
  state.form.state = 'parsing';
};

const makrFormStateAsAdding = (state) => {
  state.form.feedbacks = [{ message: 'RSS feed is adding...' }];
  state.form.state = 'adding';
};

const markFormStateAsAdded = (state) => {
  state.form.feedbacks = [{ message: 'The RSS feed has been added' }];
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
  markGlobalStateAsError,
  markGlobalStateAsUpdating,
  markGlobalStateAsUpdated,
  normalizeFeed,
};
