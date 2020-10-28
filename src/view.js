import onChange from 'on-change';

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

export default (state) => {
  const watchedState = onChange(state, (path, value, previousValue) => {
    console.log('Path -> ', path);
    console.log('Value -> ', value);
    console.log('PrevValue -> ', previousValue);
  });

  const rssForm = document.createElement('div');
  rssForm.classList.add('jumbotron');

  const header = document.createElement('h1');
  header.classList.add('display-4');
  header.textContent = 'RSS aggreagator';
  rssForm.appendChild(header);

  const rssInputField = document.createElement('input');
  rssInputField.classList.add('form-control');
  rssInputField.setAttribute('type', 'text');
  rssInputField.setAttribute('aria-label', 'RSS');
  rssForm.appendChild(rssInputField);

  const hr = document.createElement('hr');
  hr.classList.add('my-4');
  rssForm.appendChild(hr);

  const addButton = document.createElement('a');
  addButton.classList.add('btn', 'btn-primary', 'btn-lg');
  addButton.textContent = 'Add';
  rssForm.appendChild(addButton);

  const main = document.createElement('main');
  main.classList.add('flex-grow-1');

  main.appendChild(rssForm);

  const rssTable = document.createElement('div');
  rssTable.classList.add('container-xl');

  const feeds = prepareFeeds(watchedState.feeds, watchedState.items);

  feeds.forEach((f) => {
    rssTable.appendChild(f.feed);
    rssTable.append(...f.items);
  });

  main.appendChild(rssTable);

  return main;
};
