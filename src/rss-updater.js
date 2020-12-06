/* eslint-disable no-param-reassign */
import _ from 'lodash';
import makeRequest from './rss-feed-requester';
import parseFeed from './rss-feed-parser';
import { markFormStateAsError, markFormStateAsAwaitig } from './utils';

const syncTime = 5 * 1000; // 5 sec

const getNewPosts = (newPosts, currentPosts) => _.differenceWith(
  newPosts, currentPosts, (newPost, currentPost) => newPost.id === currentPost.id,
);

const updateFeeds = (state) => {
  markFormStateAsAwaitig(state);
  state.feeds.forEach((feed) => {
    makeRequest(feed.rssUrl)
      .then((response) => {
        try {
          return Promise.resolve(parseFeed(response.data));
        } catch {
          return Promise.reject(new Error('Invalid RSS format'));
        }
      })
      .then((parsedFeed) => {
        const newPosts = getNewPosts(parsedFeed.items, state.items);
        state.items.push(...newPosts);
        state.form.state = 'updating';
        state.showedItemsIds.push(...newPosts.map((i) => i.id));
        state.form.state = 'updated';
      })
      .catch(() => {
        markFormStateAsError({ state, err: { message: 'canNotUpdateFeedError' }, params: { name: feed.name } });
      });
  });
  setTimeout(updateFeeds, syncTime, state);
};

export default updateFeeds;
