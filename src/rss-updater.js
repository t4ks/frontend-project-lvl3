/* eslint-disable no-param-reassign */
import _ from 'lodash';
import makeRequest from './requester';
import {
  markGlobalStateAsError,
  markGlobalStateAsUpdating,
  markGlobalStateAsUpdated,
  normalizeFeed,
} from './utils';

const syncTime = 5 * 1000; // 5 sec

const getNewPosts = (newPosts, currentPosts) => _.differenceWith(
  newPosts, currentPosts, (newPost, currentPost) => newPost.id === currentPost.id,
);

const updateFeeds = (state) => {
  state.feeds.forEach((feed) => {
    makeRequest(feed.rssUrl)
      .then((response) => normalizeFeed(response.data))
      .then((parsedFeed) => {
        const newPosts = getNewPosts(parsedFeed.items, state.items);
        state.items.push(...newPosts);
        markGlobalStateAsUpdating(state);
        state.showedItemsIds.push(...newPosts.map((i) => i.id));
        markGlobalStateAsUpdated(state);
      })
      .catch(() => {
        markGlobalStateAsError({ state, err: { message: 'canNotUpdateFeedError' }, params: { name: feed.name } });
      });
  });
  setTimeout(updateFeeds, syncTime, state);
};

export default updateFeeds;
