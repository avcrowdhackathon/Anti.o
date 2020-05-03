import axios from 'axios';

const articlesBaseUrl = 'http://newsapi.org/v2/everything'
const queryString = 'κορονοϊός';

const getFromDate = () => {
  const days = 30;
  const date = new Date();
  const last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
  const day = last.getDate();
  const month = last.getMonth() + 1;
  const year = last.getFullYear();
  return `${year}-${month}-${day}`;
}

export default async locationQuery => {
  const query = encodeURI(`${queryString}${locationQuery ? '+AND+' + locationQuery : ''}`)
  const url = `${articlesBaseUrl}?q=${query}&from=${getFromDate()}&sortBy=publishedAt&apiKey=6a1843a983f940459830acc56672cd87`
  return await axios.get(url)
};