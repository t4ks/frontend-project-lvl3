import _ from 'lodash';
import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';

const corsProxy = 'https://api.allorigins.win/raw?url=';

const createRssFeed = (rssFeed) => {
  const li = document.createElement('li');
  li.classList.add('list-group-item');
  const header = document.createElement('h3');
  header.textContent = rssFeed.name;
  const description = document.createElement('p');
  description.textContent = rssFeed.description;
  li.append(header, description);
  return li;
};

const createFeedItem = (feedItem) => {
  const li = document.createElement('li');
  li.classList.add('list-group-item');
  const a = document.createElement('a');
  a.href = feedItem.url;
  a.textContent = feedItem.name;
  li.append(a);
  return li;
};

const initRssTable = () => {
  const containerInnerHtml = `
    <div class="row">
      <div class="col-md-10 col-lg-8 mx-auto feeds">
        <h2>Feeds</h2>
        <ul class="list-group mb-5"></ul></div>
      </div>
      <div class="row">
      <div class="col-md-10 col-lg-8 mx-auto posts">
        <h2>Posts</h2>
        <ul class="list-group mb-5"></ul>
      </div>
    </div>
  `;
  const rssTable = document.createElement('div');
  rssTable.classList.add('container-xl');
  rssTable.innerHTML = containerInnerHtml;
  const main = document.querySelector('main');
  main.append(rssTable);
  return true;
};

const clearErrors = () => {
  const feedback = document.querySelector('.feedback');
  feedback.classList.remove(...feedback.classList);
  feedback.classList.add('feedback');
  feedback.textContent = '';
  document.querySelector('.rss-form').querySelector('input').classList.remove('is-invalid');
};

const showErrors = (errorsMessages) => {
  const feedback = document.querySelector('.feedback');
  feedback.classList.add('text-danger');
  feedback.textContent = errorsMessages.join(', ');
  document.querySelector('.rss-form').querySelector('input').classList.add('is-invalid');
};

const toggleErrorMessages = (errorsMessages) => (
  errorsMessages.length === 0 ? clearErrors() : showErrors(errorsMessages)
);

const parseFeed = (xmlDoc) => {
  const channel = xmlDoc.querySelector('channel');
  const posts = xmlDoc.querySelector('channel').querySelectorAll('item');
  const feedId = _.uniqueId();
  return {
    feed: {
      id: feedId,
      name: channel.querySelector('title').textContent,
      description: channel.querySelector('description').textContent,
    },
    items: Array.from(posts).map((item) => {
      const title = item.querySelector('title').textContent;
      const url = item.querySelector('link').textContent;
      return {
        id: _.uniqueId(), name: title, url, feedId,
      };
    }),
  };
};

const addPosts = (items) => {
  const itemsElements = items.map(createFeedItem);
  const rssPostList = document.querySelector('div.posts').querySelector('.list-group');
  rssPostList.append(...itemsElements);
};

const addFeed = (feed) => {
  const feedElement = createRssFeed(feed);
  const rssFeeds = document.querySelector('div.feeds').querySelector('.list-group');
  rssFeeds.appendChild(feedElement);
};

const clearRssInput = () => {
  const input = document.querySelector('input.form-control');
  input.value = '';
};

export default (state) => {
  const watchedState = onChange(state, (path, value, previousValue) => {
    if (path === 'errors') {
      return toggleErrorMessages(value);
    }
    if (path === 'feeds') {
      clearRssInput();
      return previousValue.length === 0
        ? initRssTable() && addFeed(_.last(value)) : addFeed(_.last(value));
    }
    if (path === 'items') {
      const newItems = value.filter((v) => (
        _.find(previousValue, (i) => i.id === v.id) === undefined
      ));
      return addPosts(newItems);
    }
    return null;
  });

  const schema = yup.object().shape({
    rssUrl: yup
      .string()
      .url()
      .test('check-rss-url-uniq', 'Rss already exist', (value) => (
        _.find(watchedState.feeds, (f) => f.rssUrl === value) === undefined
      )),
  });

  const handleRssFieldChange = (e) => {
    watchedState.form.rssUrl = e.target.value;
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    watchedState.errors = [];
    schema
      .validate({ rssUrl: watchedState.form.rssUrl })
      .then(() => {
        axios
          .get(`${corsProxy}${watchedState.form.rssUrl}`)
          .then((response) => {
            const domparser = new DOMParser();
            const parsedFeed = parseFeed(domparser.parseFromString(response.data, 'application/xml'));
            watchedState.feeds.push({ rssUrl: watchedState.form.rssUrl, ...parsedFeed.feed });
            watchedState.items.push(...parsedFeed.items);
          })
          .catch((err) => {
            watchedState.errors = ['Network error'];
            console.log('err -> ', err);
          });
      })
      .catch((err) => {
        watchedState.errors = err.errors;
      });
  };

  document.querySelector('input.form-control').addEventListener('input', handleRssFieldChange);
  document.querySelector('.rss-form').addEventListener('submit', handleSubmitForm);
};
