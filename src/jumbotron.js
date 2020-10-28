import view from './view';

export default () => {
  const state = {
    feeds: [{ id: 1, name: 'Test 1', url: 'https://spam.com' }, { id: 2, name: 'Test 2', url: 'https://ham.com' }],
    items: [
      { feedId: 1, id: 33, name: 'Item 1', url: 'https://spam.com/1' },
      { feedId: 1, id: 32, name: 'Item 2', url: 'https://spam.com/2' },
      { feedId: 2, id: 12, name: 'Item 3', url: 'https://spam.com/4' },
    ],
    form: {
      rssUrl: '',
    },
  };

  return view(state);
};
