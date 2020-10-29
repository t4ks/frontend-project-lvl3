import onChange from 'on-change';
import * as yup from 'yup';

const createRssFeed = (rssFeed) => {
  const feedRow = document.createElement('div');
  feedRow.classList.add('row');
  const div = document.createElement('div');
  div.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'feeds');
  const a = document.createElement('a');
  a.setAttribute('href', rssFeed.url);
  a.textContent = rssFeed.name;
  div.appendChild(a);
  feedRow.appendChild(div);
  return feedRow;
};

const createFeedItem = (feedItem) => {
  const itemRow = document.createElement('div');
  itemRow.classList.add('row');
  const div = document.createElement('div');
  div.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'posts');
  const a = document.createElement('a');
  a.setAttribute('href', feedItem.url);
  a.textContent = feedItem.name;
  div.appendChild(a);
  itemRow.appendChild(div);
  return itemRow;
};

const prepareFeeds = (rssFeeds, rssItems) => {
  const feeds = rssFeeds.map((feed) => {
    const feedRow = createRssFeed(feed);
    const feedItems = rssItems.filter((r) => r.feedId === feed.id).map(createFeedItem);
    return { feed: feedRow, items: feedItems };
  });
  return feeds;
};

const showErrors = (errorMessages) => {
  const feedback = document.querySelector('.feedback');
  feedback.classList.add('text-danger');
  feedback.textContent = errorMessages.join(', ');
  document.querySelector('.rss-form').querySelector('input').classList.add('is-invalid');
};

const clearErrors = () => {
  const feedback = document.querySelector('.feedback');
  feedback.classList.remove(...feedback.classList);
  feedback.classList.add('feedback');
  feedback.textContent = '';
  document.querySelector('.rss-form').querySelector('input').classList.remove('is-invalid');
};

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
  return rssTable;
};

export default (state) => {
  const watchedState = onChange(state, (path, value, previousValue) => {
    console.log('Path -> ', path);
    console.log('Value -> ', value);
    console.log('PrevValue -> ', previousValue);
  });

  const rssJumbotron = initJumbotron();
  const rssTable = initRssTable();

  const schema = yup.object().shape({
    rssUrl: yup.string().url(),
  });

  const handleRssFieldChange = (e) => {
    watchedState.form.rssUrl = e.target.value;
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    clearErrors();
    schema.validate({ rssUrl: watchedState.form.rssUrl }).catch((err) => {
      showErrors(err.errors);
    });
  };

  const main = document.createElement('main');
  main.classList.add('flex-grow-1');

  const feeds = prepareFeeds(watchedState.feeds, watchedState.items);

  feeds.forEach((f) => {
    rssTable.appendChild(f.feed);
    rssTable.append(...f.items);
  });

  rssJumbotron.querySelector('input.form-control').addEventListener('change', handleRssFieldChange);
  rssJumbotron.querySelector('.rss-form').addEventListener('submit', handleSubmitForm);

  main.appendChild(rssJumbotron);
  main.appendChild(rssTable);

  return main;
};
