import { promises as fs } from 'fs';
import path from 'path';
import app from '../src/jumbotron';

beforeEach(async () => {
  const initHtml = await fs.readFile(path.join(__dirname, '__fixtures__', 'index.html'), 'utf-8');
  document.body.innerHTML = initHtml;
});

test('init', () => {
  app();
  expect(document.body.outerHTML).toMatchSnapshot();
});
