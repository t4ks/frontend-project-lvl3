import { promises as fs } from 'fs';
import path from 'path';
import $ from 'jquery';
import app from '../src/jumbotron';

beforeEach(async () => {
  const initHtml = await fs.readFile(path.join(__dirname, '__fixtures__', 'index.html'), 'utf-8');
  document.write(initHtml);
  app();
});

test('init', async () => {
  expect(document.body.outerHTML).toMatchSnapshot();
});

test('invalid rss', async () => {
  const input = document.querySelector('.form-control');
  $(input).val('lalalal').trigger('change');
  const form = document.querySelector('.rss-form');
  $(form).on('submit');
  expect(document.body.outerHTML).toMatchSnapshot();
});