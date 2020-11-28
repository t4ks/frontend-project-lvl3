import _ from 'lodash';
import onChange from 'on-change';
import { handleRssFieldChange, handleSubmitForm } from './handlers';
import updateFeeds from './rss-updater';

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

const showErrors = (errorsMessages, translator) => {
  const feedback = document.querySelector('.feedback');
  feedback.classList.add('text-danger');
  feedback.textContent = errorsMessages
    .map((message) => (_.isArray(message) ? translator(...message) : translator(message)))
    .join(', ');
  document.querySelector('.rss-form').querySelector('input').classList.add('is-invalid');
};

const toggleErrorMessages = (errorsMessages, translator) => (
  errorsMessages.length === 0 ? clearErrors() : showErrors(errorsMessages, translator)
);

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

export default (state, translator) => {
  const watchedState = onChange(state, (path, value, previousValue) => {
    if (path === 'errors') {
      return toggleErrorMessages(value, translator);
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

  document.body.classList.add('d-flex', 'flex-column', 'min-vh-100');
  document.querySelector('input.form-control').addEventListener('input', handleRssFieldChange(watchedState));
  document.querySelector('.rss-form').addEventListener('submit', handleSubmitForm(watchedState));
  updateFeeds(watchedState);
};
