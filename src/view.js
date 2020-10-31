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
  rssInputField.setAttribute('autofocus', '');
  rssInputField.setAttribute('aria-label', 'RSS');
  rssInputField.setAttribute('required', '');
  rssInputField.setAttribute('placeholder', 'Input RSS link');
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

  return jumbotronElement;
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

  return rssTable;
};

const parseFeed = (xmlDoc) => {
  console.log('xmlDoc -> ', xmlDoc);
  return xmlDoc;
};

const addFeedInfo = (feed, feedItems) => {
  const feedElement = createRssFeed(feed);
  const rssFeeds = document.querySelector('div.feeds').querySelector('.list-group');
  rssFeeds.appendChild(feedElement);

  const feedItemsElements = feedItems.map(createFeedItem);
  const rssPosts = document.querySelector('.posts').querySelector('.list-group');
  rssPosts.append(...feedItemsElements);
};

export default (state) => {
  const watchedState = onChange(state, (path, value, previousValue) => {
    if (path === 'errors') {
      return toggleErrorMessages(value);
    }
    if (path === 'feeds') {
      const items = state.items.filter((i) => i.feedId === value.id);
      return addFeedInfo(value, items);
    }
    if (path === 'items') {
      const newItems = value.filter((v) => !previousValue.includes(v));
    }
  });

  const main = document.createElement('main');
  main.classList.add('flex-grow-1');

  const rssJumbotron = initJumbotron();
  const rssTable = initRssTable();
  main.append(rssJumbotron, rssTable);

  const schema = yup.object().shape({
    rssUrl: yup.string().url(),
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
            watchedState.feeds.push(parseFeed(domparser.parseFromString(response.data, 'application/xml')));
            console.log('RESPONSE DATA -> ', watchedState.feeds);
          })
          .catch(() => {
            watchedState.errors = ['Network error'];
          });
      })
      .catch((err) => {
        watchedState.errors = err.errors;
      });
  };

  rssJumbotron.querySelector('input.form-control').addEventListener('change', handleRssFieldChange);
  rssJumbotron.querySelector('.rss-form').addEventListener('submit', handleSubmitForm);

  window.addEventListener('load', () => {
    watchedState.feeds.forEach((feed) => {
      const items = watchedState.items.filter((i) => i.feedId === feed.id);
      addFeedInfo(feed, items);
    });
  });

  return main;
};