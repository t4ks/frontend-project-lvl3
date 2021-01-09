/* eslint-disable no-param-reassign */
import _ from 'lodash';
import makeRequest from './requester';
import parseFeed from './rss-feed-parser';

const syncTime = 5 * 1000; // 5 sec

const getNewPosts = (newPosts, currentPosts) => _.differenceWith(
  newPosts, currentPosts, (newPost, currentPost) => newPost.id === currentPost.id,
);

const updateFeeds = (state) => {
  state.feeds.forEach((feed) => {
    makeRequest(feed.rssUrl)
      .then((response) => {
        const parsedFeed = parseFeed(response.data);
        const newPosts = getNewPosts(parsedFeed.items, state.items);
        state.items.push(...newPosts);
        state.state = 'updating';
        state.showedItemsIds.push(...newPosts.map((i) => i.id));
        state.state = 'updated';
      })
      .catch((err) => {
        state.error = `The rss feed: ${feed.name} has not updated. Original error: ${err.message}`;
        state.state = 'error';
      });
  });
  setTimeout(updateFeeds, syncTime, state);
};

export default updateFeeds;
