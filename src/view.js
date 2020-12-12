import _ from 'lodash';
import onChange from 'on-change';

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

const showModal = (title, description) => (e) => {
  e.preventDefault();
  const modal = document.querySelector('#showPostDescription');
  const postDescription = modal.querySelector('.post-description');
  postDescription.textContent = description;
  const postTitle = modal.querySelector('#showPostDescriptionLabel');
  postTitle.textContent = title;
  modal.classList.add('show');
  modal.setAttribute('aria-modal', true);
  modal.removeAttribute('aria-hidden');
  modal.removeAttribute('style');
  modal.style.display = 'block';
  modal.style.paddingRight = '12px';
};

const createFeedItem = (feedItem) => {
  const feedItemContentHtml = `
    <div class="row">
      <div class="col-2">
        <button type="button" class="btn btn-outline-info post-preview">Preview</button>
      </div>
      <div class="col">
        <a href="${feedItem.url}">${feedItem.name}</a>
      </div>
    </div>`;
  const li = document.createElement('li');
  li.classList.add('list-group-item');
  li.innerHTML = feedItemContentHtml;
  li.querySelector('.post-preview').addEventListener('click', showModal(feedItem.name, feedItem.description));
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
    </div>`;
  const rssTable = document.createElement('div');
  rssTable.classList.add('container-xl');
  rssTable.innerHTML = containerInnerHtml;
  const main = document.querySelector('main');
  main.append(rssTable);
  return true;
};

const clearFeedback = () => {
  const feedback = document.querySelector('.feedback');
  feedback.classList.remove(...feedback.classList);
  feedback.classList.add('feedback');
  feedback.textContent = '';
  document.querySelector('.rss-form').querySelector('input').classList.remove('is-invalid', 'is-valid');
};

const showFeedback = (messages, translator, isValid = true) => {
  clearFeedback();
  const feedback = document.querySelector('.feedback');
  const textClass = isValid === true ? 'text-success' : 'text-danger';
  feedback.classList.add(textClass);
  feedback.textContent = messages
    .map((item) => translator(item.message, item.params))
    .join(', ');
  const classValidation = isValid === true ? 'is-valid' : 'is-invalid';
  document.querySelector('.rss-form').querySelector('input').classList.add(classValidation);
};

const addPosts = (state) => {
  const itemsElements = state.items
    .filter((i) => !state.showedItemsIds.includes(i.id))
    .map(createFeedItem);

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

const lockSubmitFormButton = () => {
  const submitButton = document.querySelector('.rss-form').querySelector('button');
  submitButton.setAttribute('disabled', '');
};

const unlockSubmitFormButton = () => {
  const submitButton = document.querySelector('.rss-form').querySelector('button');
  submitButton.removeAttribute('disabled');
};

export default (state, translator) => {
  document.body.classList.add('d-flex', 'flex-column', 'min-vh-100');
  return onChange(state, (path, value) => {
    switch (path) {
      case 'form.state':
        switch (value) {
          case 'initing-table':
            return initRssTable();
          case 'awaiting':
            unlockSubmitFormButton();
            return clearFeedback();
          case 'error':
            unlockSubmitFormButton();
            return showFeedback(state.errors, translator, { isValid: false });
          case 'updating':
            return addPosts(state);
          case 'adding':
            addFeed(_.last(state.feeds));
            return addPosts(state);
          case 'downloading':
            clearRssInput();
            lockSubmitFormButton();
            return showFeedback(state.form.feedback, translator);
          case 'parsing':
            return showFeedback(state.form.feedback, translator);
          case 'added':
            unlockSubmitFormButton();
            return showFeedback(state.form.feedback, translator);
          default:
            return null;
        }
      default:
        return null;
    }
  });
};
