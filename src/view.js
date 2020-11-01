import _ from 'lodash';
import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';

const corsProxy = 'https://cors-anywhere.herokuapp.com';

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

const initJumbotron = () => {
  const jumbotronElement = document.createElement('section');
  jumbotronElement.classList.add('jumbotron', 'jumbotron-fluid', 'bg-dark');

  const container = document.createElement('div');
  container.classList.add('container-xl');
  jumbotronElement.appendChild(container);

  const mainRow = document.createElement('div');
  mainRow.classList.add('row');
  container.appendChild(mainRow);

  const mainInfo = document.createElement('div');
  mainInfo.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'text-white');
  mainRow.appendChild(mainInfo);

  const header = document.createElement('h1');
  header.classList.add('display-3');
  header.textContent = 'RSS Reader';
  mainInfo.appendChild(header);

  const rssForm = document.createElement('form');
  rssForm.classList.add('rss-form');
  mainInfo.appendChild(rssForm);

  const formRow = document.createElement('div');
  formRow.classList.add('form-row');
  rssForm.appendChild(formRow);

  const colInput = document.createElement('div');
  colInput.classList.add('col');

  const rssInputField = document.createElement('input');
  rssInputField.classList.add('form-control', 'form-control-lg', 'w-100');
  [
    ['autofocus', ''], ['aria-label', 'RSS'], ['required', ''], ['placeholder', 'Input RSS link'],
  ].map((args) => rssInputField.setAttribute(...args));

  colInput.appendChild(rssInputField);
  formRow.appendChild(colInput);

  const feedbackContainer = document.createElement('div');
  feedbackContainer.classList.add('feedback');
  mainInfo.appendChild(feedbackContainer);

  const colButton = document.createElement('div');
  colButton.classList.add('col-auto');

  const addButton = document.createElement('button');
  addButton.classList.add('btn', 'btn-primary', 'btn-lg', 'px-sm-5');
  addButton.setAttribute('type', 'submit');
  addButton.textContent = 'Add';
  colButton.appendChild(addButton);
  formRow.appendChild(colButton);

  const main = document.querySelector('main');
  main.append(jumbotronElement);
};

const initRssTable = () => {
  const rssTable = document.createElement('div');
  rssTable.classList.add('container-xl');

  const feedsRow = document.createElement('div');
  feedsRow.classList.add('row');
  rssTable.appendChild(feedsRow);

  const feedsListContainer = document.createElement('div');
  feedsListContainer.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'feeds');
  feedsRow.appendChild(feedsListContainer);

  const feedsHeader = document.createElement('h2');
  feedsHeader.textContent = 'Feeds';
  feedsListContainer.appendChild(feedsHeader);

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'mb-5');
  feedsListContainer.appendChild(feedsList);

  const postsRow = document.createElement('div');
  postsRow.classList.add('row');
  rssTable.appendChild(postsRow);

  const postsListContainer = document.createElement('div');
  postsListContainer.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'posts');
  postsRow.appendChild(postsListContainer);

  const postsHeader = document.createElement('h2');
  postsHeader.textContent = 'Posts';
  postsListContainer.appendChild(postsHeader);

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'mb-5');
  postsListContainer.appendChild(postsList);

  const main = document.querySelector('main');
  main.append(rssTable);
};

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
      if (previousValue.length === 0) {
        initRssTable();
      }
      clearRssInput();
      return addFeed(_.last(value));
    }
    if (path === 'items') {
      const newItems = value.filter((v) => (
        _.find(previousValue, (i) => i.id === v.id) === undefined
      ));
      return addPosts(newItems);
    }
    return null;
  });

  const main = document.createElement('main');
  main.classList.add('flex-grow-1');

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
          .get(`${corsProxy}/${watchedState.form.rssUrl}`)
          .then((response) => {
            const domparser = new DOMParser();
            const parsedFeed = parseFeed(domparser.parseFromString(response.data, 'application/xml'));
            watchedState.feeds.push({ rssUrl: watchedState.form.rssUrl, ...parsedFeed.feed });
            watchedState.items.push(...parsedFeed.items);
          })
          .catch(() => {
            watchedState.errors = ['Network error'];
          });
      })
      .catch((err) => {
        watchedState.errors = err.errors;
      });
  };

  window.addEventListener('load', () => {
    initJumbotron();
    document.querySelector('input.form-control').addEventListener('change', handleRssFieldChange);
    document.querySelector('.rss-form').addEventListener('submit', handleSubmitForm);
  });

  return main;
};
