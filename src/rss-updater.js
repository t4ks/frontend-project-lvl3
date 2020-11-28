/* eslint-disable no-param-reassign */

import _ from 'lodash';
import getRssFeed from './rss-feed-requester';
import parseFeed from './rss-feed-parser';

const syncTime = 5 * 1000; // 5 sec

const updateFeeds = (state) => {
  state.feeds.forEach((feed) => {
    getRssFeed(feed.rssUrl)
      .then((response) => parseFeed(response.data))
      .then((parsedFeed) => {
        const newItems = _.differenceWith(
          parsedFeed.items, state.items, (arrVal, othVal) => arrVal.id === othVal.id,
        );
        state.items.push(...newItems);
      })
      .catch(() => {
        state.errors = [['canNotUpdateFeed', { name: feed.name }]];
      });
  });
  state.errors = [];
  setTimeout(updateFeeds, syncTime, state);
};

export default updateFeeds;
