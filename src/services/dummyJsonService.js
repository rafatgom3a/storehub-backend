const BASE_URL = 'https://dummyjson.com';

export async function getProducts(query = {}) {
  const url = new URL(`${BASE_URL}/products`);
  url.searchParams.set('limit', String(query.limit || 30));
  url.searchParams.set('skip', String(query.skip || 0));
  if (query.category) return fetch(`${BASE_URL}/products/category/${encodeURIComponent(query.category)}?${url.searchParams}`).then(readResponse);
  return fetch(url).then(readResponse);
}

export async function getProductById(id) {
  return fetch(`${BASE_URL}/products/${encodeURIComponent(id)}`).then(readResponse);
}

async function readResponse(response) {
  if (!response.ok) throw new Error(`Product provider returned ${response.status}`);
  return response.json();
}
