import * as Url from "url";
import * as _ from 'lodash';
import * as Jieba from 'nodejieba';
import {YuqueInstance} from "../interface";
export const parseUrl = (url: string): YuqueInstance => {
  const result = Url.parse(url);
  const origin = `${result.protocol}//${result.host}`;
  let pathname = result.pathname;

  if (!pathname) {
    throw Error("解析失败");
  }

  pathname = pathname.replace(/^\//, "");
  const [group, repo, doc] = pathname.split("/");

  return {
    origin,
    slug: doc,
    name: group + "_" + repo,
    url,
    namespace: group + "/" + repo,
  };
};

export const segmentResult = (text, slug, searchJson) => {
  var arr = Jieba.cut(text);
  for (let i = 0; i < arr.length; i++) {
    if (searchJson[arr[i]] && searchJson[arr[i]].length) {
      searchJson[arr[i]].push(slug)
      searchJson[arr[i]] = _.uniq(searchJson[arr[i]]);
    } else {
      searchJson[arr[i]] = [slug]
    }
  }
}
