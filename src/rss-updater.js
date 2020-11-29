/* eslint-disable no-param-reassign */
import _ from 'lodash';
import getRssFeed from './rss-feed-requester';
import parseFeed from './rss-feed-parser';

const syncTime = 5 * 1000; // 5 sec

const getNewItems = (newItems, currentItems) => _.differenceWith(
  newItems, currentItems, (arrVal, othVal) => arrVal.id === othVal.id,
);

const updateFeeds = (state) => {
  state.form.state = 'valid';
  state.feeds.forEach((feed) => {
    getRssFeed(feed.rssUrl)
      .then((response) => parseFeed(response.data))
      .then((parsedFeed) => {
        const newItems = getNewItems(parsedFeed.items, state.items);
        state.items.push(...newItems);
        state.newItems = newItems;
        state.form.state = 'updating';
        state.form.state = 'updated';
        state.newItems = [];
      })
      .catch(() => {
        state.errors = [['canNotUpdateFeed', { name: feed.name }]];
        state.form.state = 'error';
      });
  });
  setTimeout(updateFeeds, syncTime, state);
};

export default updateFeeds;
