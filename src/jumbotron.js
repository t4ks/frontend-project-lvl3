import view from './view';

export default () => {
  const state = {
    feeds: [],
    items: [],
    form: {
      rssUrl: '',
    },
    errors: [],
  };

  return view(state);
};
