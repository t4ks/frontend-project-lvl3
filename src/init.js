import i18next from 'i18next';
import { setLocale } from 'yup';
import view from './view';
import ru from '../locales/ru';
import { handleRssFieldChange, handleSubmitForm } from './handlers';
import updateFeeds from './rss-updater';

const closeModal = (e) => {
  e.preventDefault();
  const modal = document.querySelector('#showPostDescription');
  modal.classList.remove('show');
  modal.removeAttribute('aria-modal');
  modal.removeAttribute('style');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', true);
};

export default () => {
  const state = {
    feeds: [],
    items: [],
    showedItemsIds: [],
    form: {
      feedback: [],
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

    const postModal = document.querySelector('#showPostDescription');
    postModal.querySelector('.btn-close').addEventListener('click', closeModal);

    updateFeeds(watchedState);
  });
};
