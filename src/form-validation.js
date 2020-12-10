import * as yup from 'yup';

const getFormValidationSchema = (state) => (
  yup.object().shape({
    rssUrl: yup
      .string()
      .url('Please input a valid URL')
      .notOneOf(state.feeds.map((f) => f.rssUrl), 'Rss already exist'),
  })
);

export default getFormValidationSchema;
