import i18next from 'i18next';
import { setLocale } from 'yup';
import $ from 'jquery';
import view from './view';
import ru from '../locales/ru';
import { handleRssFieldChange, handleSubmitForm } from './handlers';
import updateFeeds from './rss-updater';

const closeModal = (e) => {
  e.preventDefault();
  $('#showPostDescription').modal({ show: false });
};

export default () => {
  const state = {
    feeds: [],
    items: [],
    showedItemsIds: [],
    state: 'initing',
    form: {
      feedbacks: [],
      state: 'awaiting',
      data: {
        url: '',
      },
      errors: [],
    },
    errors: [],
  };

  i18next.init({
    lng: 'ru',
    resources: { ru },
  }).then((t) => {
    setLocale({
      string: {
        url: 'Please input a valid URL',
      },
    });
    const watchedState = view(state, t);
    const form = document.querySelector('.rss-form');
    const formInput = form.querySelector('.form-control');
    formInput.addEventListener('input', handleRssFieldChange(watchedState));
    form.addEventListener('submit', handleSubmitForm(watchedState));

    // enable close listener for post modal
    const postModal = document.querySelector('#showPostDescription');
    postModal.querySelector('.btn-close').addEventListener('click', closeModal);

    // run watchers
    updateFeeds(watchedState);
  });
};
