/* eslint-disable no-param-reassign */

const markFormStateAsValid = (state) => {
  state.errors = [];
  state.form.state = 'valid';
};

const markFormStateAsError = ({ state, err, params = {} }) => {
  state.errors = [{ message: err.message, params }];
  state.form.state = 'error';
};

export { markFormStateAsValid, markFormStateAsError };
