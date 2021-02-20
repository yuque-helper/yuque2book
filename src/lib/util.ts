import * as Url from "url";

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