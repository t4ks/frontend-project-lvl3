import { promises as fs } from 'fs';
import mockAxios from 'axios';
import path from 'path';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import app from '../src/init';

const readFixture = async (fixtureName) => {
  const data = await fs.readFile(path.join(__dirname, '__fixtures__', fixtureName), 'utf-8');
  return data;
};

beforeEach(async () => {
  const initHtml = await readFixture('index.html');
  document.body.innerHTML = initHtml;
  jest.useFakeTimers();
  app();
});

afterEach(async () => {
  jest.clearAllTimers();
  jest.clearAllMocks();
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

test('invalid rss format', async () => {
  mockAxios.get.mockImplementationOnce(() => Promise.resolve({ data: 'some invalid data' }));
  fireEvent.input(screen.getByTestId('rss-field'), { target: { value: 'https://valid.url.com/news.rss' } });
  fireEvent.submit(screen.getByTestId('rss-form'));
  await waitFor(() => expect(screen.getByText('Ошибка при разборе RSS ленты.')));
  expect(document.body.outerHTML).toMatchSnapshot();
});

test('network error', async () => {
  const err = new Error('some error');
  err.isAxiosError = true;
  mockAxios.get.mockImplementationOnce(() => Promise.reject(err));
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

test('run update feeds flow', async () => {
  const rss = await readFixture('breaking_news.rss');
  mockAxios.get.mockImplementationOnce(() => Promise.resolve({ data: rss }));
  fireEvent.input(screen.getByTestId('rss-field'), { target: { value: 'https://valid.url.com/news.rss' } });
  fireEvent.submit(screen.getByTestId('rss-form'));
  await waitFor(() => expect(screen.getByText('Feeds')));

  const newPosts = await readFixture('breaking_news_new_items.rss');
  mockAxios.get.mockImplementationOnce(() => Promise.resolve({ data: newPosts }));

  jest.runOnlyPendingTimers();
  // the first init call, the second inside the updateFeeds func
  expect(setTimeout).toHaveBeenCalledTimes(2);
  // the first call add a new rss feed, the second inside the updateFeeds func
  expect(mockAxios.get).toHaveBeenCalledTimes(2);

  // new item
  await waitFor(() => expect(screen.getByText('NASA, US and European Partners Launch Mission to Monitor Global Ocean')));
  expect(document.body.outerHTML).toMatchSnapshot();
});

test('can not update feed', async () => {
  const rss = await readFixture('breaking_news.rss');
  mockAxios.get.mockImplementationOnce(() => Promise.resolve({ data: rss }));
  fireEvent.input(screen.getByTestId('rss-field'), { target: { value: 'https://valid.url.com/news.rss' } });
  fireEvent.submit(screen.getByTestId('rss-form'));
  await waitFor(() => expect(screen.getByText('Feeds')));

  mockAxios.get.mockImplementationOnce(() => Promise.resolve({ data: 'some invalid data' }));

  jest.runOnlyPendingTimers();
  // the first init call, the second inside the updateFeeds func
  expect(setTimeout).toHaveBeenCalledTimes(2);
  // the first call added a new rss feed, the second inside the updateFeeds func
  expect(mockAxios.get).toHaveBeenCalledTimes(2);
  await waitFor(() => expect(screen.getByText('Ошибка при обновлении RSS ленты: NASA Breaking News')));
  expect(document.body.outerHTML).toMatchSnapshot();
});
