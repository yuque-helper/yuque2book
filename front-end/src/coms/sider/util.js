export const toTreeToc = (toc) => {
  if(!Array.isArray(toc)){
    throw Error('toc 不是一个数组');
  }

  const length = toc.length;
  for(let i = length - 1; i >= 0; i--){
    const t = toc.pop();
    if(t.depth === 1){
      toc.unshift(
        {
          ...t,
          key: t.title + t.slug + t.depth
        }
      );
      continue;
    }
    findAndInsert(t, toc);
  }
  return toc;
};

// 找到最近的一个父节点, 并且unshift
const findAndInsert = (t, toc) => {
  for(let i = toc.length - 1; i >= 0; i--){
    if(toc[i].depth === t.depth - 1){
      if(!toc[i].children){
        toc[i].children = [];
      }
      toc[i].children.unshift(t);
      return;
    }
  }
}