export default () => {
  const div = document.createElement('div');
  div.classList.add('jumbotron');
  const header = document.createElement('h1');
  header.classList.add('display-4');
  header.textContent = 'RSS aggreagator';
  div.appendChild(header);

  const rssInputField = document.createElement('input');
  rssInputField.classList.add('form-control');
  rssInputField.setAttribute('type', 'text');
  rssInputField.setAttribute('aria-label', 'RSS');
  div.appendChild(rssInputField);

  const hr = document.createElement('hr');
  hr.classList.add('my-4');
  div.appendChild(hr);

  const addButton = document.createElement('a');
  addButton.classList.add('btn', 'btn-primary', 'btn-lg');
  addButton.textContent = 'Add';
  div.appendChild(addButton);

  return div;
};
