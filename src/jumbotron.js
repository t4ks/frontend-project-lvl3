import i18next from 'i18next';
import render from './view';
import ru from '../locales/ru';

export default () => {
  const state = {
    feeds: [],
    items: [],
    form: {
      rssUrl: '',
    },
    errors: [],
  };

  i18next.init({
    lng: 'ru',
    resources: { ru },
  }).then((t) => {
    document.body.classList.add('d-flex', 'flex-column', 'min-vh-100');
    render(state, t);
  });
};
