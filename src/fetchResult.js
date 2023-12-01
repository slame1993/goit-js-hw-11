import axios from 'axios';

export async function fetchResult(searchWord, page) {
  const URL = 'https://pixabay.com/api/';
  const API_KEY = '41017255-f221164a5ff41e38a5939f188';
  const params = new URLSearchParams({
    key: API_KEY,
    q: searchWord,
    per_page: 40,
    page: page,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });
  return await axios.get(`${URL}?${params}`).then(response => response.data);
}
