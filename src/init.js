import i18next from 'i18next';
import render from './view';
import ru from '../locales/ru';

export default () => {
  const state = {
    feeds: [],
    items: [],
    form: {
      state: '',
      data: {
        url: '',
      },
    },
    errors: [],
  };

  i18next.init({
    lng: 'ru',
    resources: { ru },
  }).then((t) => {
    render(state, t);
  });
};
