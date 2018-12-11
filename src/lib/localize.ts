import * as cheerio from "cheerio";
import * as co from "co";
import * as debug from "debug";
import * as fs from "fs-extra";
import * as _ from "lodash";
import * as path from "path";
import {Writable} from "stream";
import * as request from "superagent";
import * as util from "util";

const log = debug("yuque2book");

// TODO: !! THE FILE TO BE TO REFACTOR AND TEST !!

const reg = /.*\/(.*\.[a-zA-Z]+)$/;
const yuqueUrlCheckReg = /^https:\/\/.*yuque\.[^.]+\.com/;

const pipePromise = (reader: request.SuperAgentRequest, writer: Writable) => {
  return new Promise((res, rej) => {
    reader.pipe(writer);
    reader.on("end", res);
    reader.on("close", res);
    reader.on("err", rej);
  });
};

export const localize = (dir: string, folder: string, token: string) => {
  const readDir = util.promisify(fs.readdir);

  return co(function*() {
    const base = path.join(folder);

    // make images dir
    yield fs.ensureDir(path.join(base, "img"));
    yield fs.ensureDir(path.join(base, "attach"));

    let list = yield readDir(base);
    list = list.filter((name: string) => name.endsWith(".json"));

    for (const h of list) {
      // TODO: 将阻塞api移除
      const json = JSON.parse(fs.readFileSync(path.join(base, h)).toString());
      const html = json.body_html;
      if (!html) {
        continue;
      }

      const $ = cheerio.load(html);
      // 保存图片
      yield saveFiles($, "img", "src", base, "img", undefined, null, token);
      // 保存附件, 并且只保存上传到语雀上的附件
      yield saveFiles($, "a", "href", base, "attach", yuqueUrlCheckReg, (src: string) => {
        return src.replace("/attachments/", "/api/v2/attachments/");
      }, token);

      toLocalUrl($, yuqueUrlCheckReg);

      const _html = $("html").html();
      fs.writeFileSync(path.join(base, h),
        JSON.stringify(
          {
            ...json,
            body_html: `<div>${_html}</div>`,
          },
          null,
          2,
        ),
      );
    }
    return folder;
  });
};

/**
 * 将文件保存到本地
 * @param {jQuery} $
 * @param {string} tagName 标签名称
 * @param {string} attr 标签的属性
 * @param {string} base 存放的基本地址
 * @param {string} folder 存放文件的文件夹
 * @param {regexp} filter 文件地址筛选
 * @param {function} replace src重命名
 * @return {Promise}
 */
const saveFiles = ($: CheerioStatic, tagName: string, attr: string, base: string, folder: string, filter: RegExp | null = null, replace: any, token: string) => {
  return co(function*() {
    const $files: CheerioElement[] = [];

    $(tagName).each((index, item) => {
      $files.push(item);
    });

    for (const item of $files) {
      const src = $(item).attr(attr);
      if (!src) {
        continue;
      }

      if (filter && _.isRegExp(filter)) {
        if (!filter.test(src)) {
          continue;
        }
      }

      let filename = _.get(src.match(reg), "[1]");

      if (!filename) {
        log(attr, " can not be match", src);
        continue;
      }

      filename = filename.replace("/", "-");
      filename = decodeURIComponent(filename);
      const fileSaveDir = path.join(base, folder);
      if (!fs.existsSync(fileSaveDir)) {
        fs.mkdirpSync(fileSaveDir);
      }
      let targetUrl = src;
      if (replace && typeof replace === "function") {
        targetUrl = replace(src);
      }

      log("download start", targetUrl);
      yield pipePromise(
        request
          (targetUrl)
          .set("X-Auth-Token", token)
          .set("User-Agent", "gitlab-build-robot")
        ,
        fs.createWriteStream(path.join(fileSaveDir, filename)),
      );

      log("create file", path.join(fileSaveDir, filename));

      log("download finish", src);
      $(item).attr(attr, `${folder}/${filename}`);
    }
  });
};

/**
 * 将文档中的语雀url全部转换成本地的url
 * 所有的yuque的url，都会变成 otherBooks/${group}_${book}这样的形式
 * 所以你的yuque文档如果外链了别的文档, 那么你就必须将另外一本book下载之后存放在这本book下
 * TODO: 如果两本book嵌套链接怎么办?
 * @param {jQuery} $
 */
const toLocalUrl = ($: CheerioStatic, filter: RegExp) => {
  const $links: CheerioElement[] = [];
  $("a").each((index, item) => {
    $links.push(item);
  });

  for (const link of $links) {
    const src = $(link).attr("href");
    if (!src) {
      continue;
    }
    if (_.isRegExp(filter)) {
      if (!filter.test(src)) {
        continue;
      }
    }

    // ["https:", "", "yuque.antfin-inc.com", "dtboost", "qd6g6q", "evcrbc"]
    const [protocol, white, host, group, book, page] = src.split("/");
    log("url parser", protocol, white, host, group, book, page);
    if (!group) {
      continue;
    }

    let newLink = "";

    const links = page.split("#");
    if (page) {
      newLink += `#/${links[0]}.html#${_.get(links, "[1]")}`;
    }

    $(link).attr("href", newLink);
  }
};
