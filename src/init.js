import i18next from 'i18next';
import view from './view';
import ru from '../locales/ru';
import { handleRssFieldChange, handleSubmitForm } from './handlers';
import updateFeeds from './rss-updater';

export default () => {
  const state = {
    feeds: [],
    items: [],
    newItems: [],
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
    const watchedState = view(state, t);
    document.querySelector('input.form-control').addEventListener('input', handleRssFieldChange(watchedState));
    document.querySelector('.rss-form').addEventListener('submit', handleSubmitForm(watchedState));
    updateFeeds(watchedState);
  });
};