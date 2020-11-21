import { promises as fs } from 'fs';
import mockAxios from 'axios';
import path from 'path';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import app from '../src/jumbotron';

const readFixture = async (fixtureName) => {
  const data = await fs.readFile(path.join(__dirname, '__fixtures__', fixtureName), 'utf-8');
  return data;
};

beforeEach(async () => {
  const initHtml = await readFixture('index.html');
  document.body.innerHTML = initHtml;
  app();
});

test('init', async () => {
  expect(document.body.outerHTML).toMatchSnapshot();
});

test('invalid rss', async () => {
  fireEvent.input(screen.getByTestId('rss-field'), { target: { value: 'aaaaa' } });
  fireEvent.submit(screen.getByTestId('rss-form'));
  await waitFor(() => expect(screen.getByText('Введите корректный URL-адрес')));
  expect(document.body.outerHTML).toMatchSnapshot();
});

test('add rss', async () => {
  const rss = await readFixture('breaking_news.rss');
  mockAxios.get.mockImplementationOnce(() => Promise.resolve({ data: rss }));
  fireEvent.input(screen.getByTestId('rss-field'), { target: { value: 'https://valid.url.com/news.rss' } });
  fireEvent.submit(screen.getByTestId('rss-form'));
  await waitFor(() => expect(screen.getByText('Feeds')));
  expect(document.body.outerHTML).toMatchSnapshot();
});

test('network error', async () => {
  mockAxios.get.mockImplementationOnce(() => Promise.reject(new Error('some error')));
  fireEvent.input(screen.getByTestId('rss-field'), { target: { value: 'https://valid.url.com/news.rss' } });
  fireEvent.submit(screen.getByTestId('rss-form'));
  await waitFor(() => expect(screen.getByText('Сетевая ошибка')));
  expect(document.body.outerHTML).toMatchSnapshot();
});

test('try to add the same rss feed twice', async () => {
  const rss = await readFixture('breaking_news.rss');
  mockAxios.get.mockImplementationOnce(() => Promise.resolve({ data: rss }));
  fireEvent.input(screen.getByTestId('rss-field'), { target: { value: 'https://valid.url.com/news.rss' } });
  fireEvent.submit(screen.getByTestId('rss-form'));
  await waitFor(() => expect(screen.getByText('Feeds')));
  fireEvent.input(screen.getByTestId('rss-field'), { target: { value: 'https://valid.url.com/news.rss' } });
  fireEvent.submit(screen.getByTestId('rss-form'));
  await waitFor(() => expect(screen.getByText('RSS лента уже была добавлена')));
  expect(document.body.outerHTML).toMatchSnapshot();
});
