import render from './view';

export default () => {
  const state = {
    feeds: [],
    items: [],
    form: {
      rssUrl: '',
    },
    errors: [],
  };

  document.body.classList.add('d-flex', 'flex-column', 'min-vh-100');
  render(state);
};
