import { promises as fs } from 'fs';
import path from 'path';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import app from '../src/jumbotron';

beforeEach(async () => {
  const initHtml = await fs.readFile(path.join(__dirname, '__fixtures__', 'index.html'), 'utf-8');
  document.body.innerHTML = initHtml;
  app();
});

test('init', async () => {
  expect(document.body.outerHTML).toMatchSnapshot();
});

test('invalid rss', async () => {
  fireEvent.change(screen.getByTestId('rss-field'), { target: { value: 'aaaaa' } });
  fireEvent.submit(screen.getByTestId('rss-form'));
  await waitFor(() => expect(screen.getByText('rssUrl must be a valid URL')));
  expect(document.body.outerHTML).toMatchSnapshot();
});
