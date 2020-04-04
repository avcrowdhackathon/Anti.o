import axios from 'axios';

const articlesBaseUrl = 'http://newsapi.org/v2/everything'
const queryString = 'κορονοϊός';
const fromDate = '2020-03-06';

export default async locationQuery => {
  const query = encodeURI(`${queryString}${locationQuery ? '+AND+' + locationQuery : ''}`)
  const url = `${articlesBaseUrl}?q=${query}&from=${fromDate}&sortBy=publishedAt&apiKey=6a1843a983f940459830acc56672cd87`
  return await axios.get(url)
};