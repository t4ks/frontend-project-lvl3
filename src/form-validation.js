import * as yup from 'yup';
import _ from 'lodash';

const getFormValidationSchema = (state) => (
  yup.object().shape({
    rssUrl: yup
      .string()
      .url('Please input a valid URL')
      .test('check-rss-url-uniq', 'Rss already exist', (value) => (
        _.find(state.feeds, (f) => f.rssUrl === value) === undefined
      )),
  })
);

export default getFormValidationSchema;
