import _ from 'lodash';
import $ from 'jquery';
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

const markLinkAsRead = (element) => {
  element.classList.remove('font-weight-bold');
  element.classList.add('font-weight-normal');
};

const showModal = (feedItem) => (e) => {
  e.preventDefault();
  const modal = document.querySelector('#showPostDescription');
  const postDescription = modal.querySelector('.post-description');
  postDescription.textContent = feedItem.description;
  const postTitle = modal.querySelector('#showPostDescriptionLabel');
  postTitle.textContent = feedItem.name;
  $(modal).modal({ show: true });
  const feedItemRow = document.querySelector(`[data-feed-item-id='${feedItem.id}']`);
  markLinkAsRead(feedItemRow);
};

const createFeedItem = (feedItem) => {
  const feedItemContentHtml = `
    <div class="row font-weight-bold" data-feed-item-id="${feedItem.id}">
      <div class="col-2">
        <button type="button" class="btn btn-outline-info post-preview">Preview</button>
      </div>
      <div class="col">
        <a target="_blank" href="${feedItem.url}">${feedItem.name}</a>
      </div>
    </div>`;
  const li = document.createElement('li');
  li.classList.add('list-group-item');
  li.innerHTML = feedItemContentHtml;
  li.querySelector('.post-preview').addEventListener('click', showModal(feedItem));
  li.querySelector('a').addEventListener('click', (e) => markLinkAsRead(e.target));
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

const clearFormFeedback = () => {
  const feedback = document.querySelector('#form-feedback');
  feedback.classList.remove(...feedback.classList);
  feedback.classList.add('feedback');
  feedback.textContent = '';
  const input = document.querySelector('.rss-form').querySelector('input');
  input.classList.remove('is-invalid', 'is-valid');
};

const renderFormFeedback = (message, translator) => {
  const feedback = document.querySelector('#form-feedback');
  feedback.classList.add('text-success');
  feedback.textContent = translator(message);
  document.querySelector('.rss-form').querySelector('input').classList.add('is-valid');
};

const buildErrorElement = (error) => {
  const el = document.createElement('div');
  el.classList.add('feedback', 'text-danger');
  el.textContent = error;
  return el;
};

const renderFormErrors = (form, translator) => {
  const input = document.querySelector('input.form-control');
  const error = input.nextSibling;
  if (error) {
    error.remove();
  }

  const field = form.fields.url;
  if (field.error === null) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    clearFormFeedback();
  } else {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    const errorElement = buildErrorElement(translator(field.error));
    input.after(errorElement);
  }
};

const renderAppError = (error, translator) => {
  if (!error) return;
  const toastBody = document.querySelector('.toast-body');
  toastBody.textContent = translator(error.message, { ...error.params });
  $('.toast').toast('show');
};

const addPosts = (posts, showedPostsIds) => {
  const itemsElements = posts
    .filter((i) => !showedPostsIds.includes(i.id))
    .map(createFeedItem);
  const rssPostList = document.querySelector('div.posts').querySelector('.list-group');
  rssPostList.append(...itemsElements);
};

const addFeed = (feed) => {
  const feedElement = createRssFeed(feed);
  const rssFeeds = document.querySelector('div.feeds');
  const rssList = rssFeeds.querySelector('.list-group');
  rssList.appendChild(feedElement);
};

const clearRssInput = () => {
  const input = document.querySelector('input.form-control');
  input.value = '';
};

const lockSubmitFormButton = () => {
  const submitButton = document.querySelector('.rss-form').querySelector('button');
  submitButton.setAttribute('disabled', true);
};

const unlockSubmitFormButton = () => {
  const submitButton = document.querySelector('.rss-form').querySelector('button');
  submitButton.removeAttribute('disabled');
};

export default (state, translator) => {
  document.body.classList.add('d-flex', 'flex-column', 'min-vh-100');
  return onChange(state, (path, value) => {
    switch (path) {
      case 'form.status':
        switch (value) {
          case 'filling':
            return unlockSubmitFormButton();
          case 'downloading':
            lockSubmitFormButton();
            clearRssInput();
            return clearFormFeedback();
          case 'error':
            clearFormFeedback();
            renderFormErrors(state.form, translator);
            return unlockSubmitFormButton();
          default:
            return null;
        }
      case 'state':
        switch (value) {
          case 'initing':
            return initRssTable();
          case 'updating':
            return addPosts(state.items, state.showedItemsIds);
          case 'adding':
            addFeed(_.last(state.feeds));
            addPosts(state.items, state.showedItemsIds);
            return renderFormFeedback('app.rssAdded', translator);
          case 'error':
            return renderAppError(state.error, translator);
          default:
            return null;
        }
      default:
        return null;
    }
  });
};
