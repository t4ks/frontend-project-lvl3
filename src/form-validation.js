import * as yup from 'yup';

const getFormValidationSchema = (feeds) => (
  yup.object().shape({
    rssUrl: yup
      .string()
      .url()
      .notOneOf(feeds.map((f) => f.rssUrl)),
  })
);

export default getFormValidationSchema;
