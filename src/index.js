import _ from 'lodash';

const component = () => {
  const div = document.createElement('div');
  div.innerHTML = _.join(['Hello', 'World'], ' ');
  return div;
};

document.body.appendChild(component());
