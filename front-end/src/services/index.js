import request from 'superagent';

export const toc = async () => {
  return request.get('data/toc.json').then(d => d.body);
}

export const doc = async (slug) => {
  return request.get(`data/${slug}.json`).then(d => d.body);
}

export const getFirstSlug = async () => {
  const result = await toc();
  for(let toc of result){
    if(toc.slug !== '#'){
      return toc.slug;
    }
  }
}

export const book = async () => {
  return request.get(`data/book.json`).then(d => d.body);
}