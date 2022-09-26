import * as cheerio from "cheerio";
import * as co from "co";
import * as debug from "debug";
import * as fs from "fs-extra";
import * as _ from "lodash";
import * as path from "path";
import {Writable} from "stream";
import * as request from "superagent";
import {parse} from 'url';

const log = debug("yuque2book");

// TODO: !! THE FILE TO BE TO REFACTOR AND TEST !!

const reg = /.+\/(.+\.[a-zA-Z0-9]+).*$/;
const yuqueUrlCheckReg = /^https:\/\/.*yuque\.com/;

const pipePromise = (reader: request.SuperAgentRequest, writer: Writable) => {
  return new Promise((res, rej) => {
    reader.pipe(writer);
    writer.on("end", res);
    writer.on("close", res);
    writer.on("err", rej);
  });
};

export const localize = async (dir: string, folder: string, token: string) => {

  const base = path.join(folder);

  // make images dir
  await fs.ensureDir(path.join(base, "img"));
  await fs.ensureDir(path.join(base, "attach"));

  let list = await fs.readdir(base);
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
    await saveFiles($, "img", "src", base, "img", undefined, null, token);
    // 保存附件, 并且只保存上传到语雀上的附件
    await saveFiles($, "a", "href", base, "attach", yuqueUrlCheckReg, (src: string) => {
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
const saveFiles = ($: cheerio.Root, tagName: string, attr: string, base: string, folder: string, filter: RegExp | null = null, replace: any, token: string) => {
  return co(function*() {
    const $files: cheerio.Element[] = [];

    $(tagName).each((index, item) => {
      $files.push(item);
    });

    if(!$files.length) {
      return;
    }

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

      const pathname = parse(src).pathname;
      if(!pathname) {
        log(attr, "pathname can not be match", pathname);
        continue;
      }

      let filename = _.get(pathname.match(reg), "[1]");


      if (!filename) {
        log(attr, " can not be match", src);
        continue;
      }

      filename = filename.replace("/", "-");
      filename = path.basename(decodeURIComponent(filename));
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
      $(item).attr(attr, `data/${folder}/${filename}`);
    }
  });
};

/**
 * 将文档中的语雀url全部转换成本地的url
 * 所有的yuque的url，都会变成 otherBooks/${group}_${book}这样的形式
 * 所以你的yuque文档如果外链了别的文档, 那么你就必须将另外一本book下载之后存放在这本book下
 * TODO: 如果两本book嵌套链接怎么办?
 * @param $
 * @param filter
 */
const toLocalUrl = ($: cheerio.Root, filter: RegExp) => {
  const $links: cheerio.Element[] = [];
  $("a").each((index, item) => {
    $links.push(item);
  });

  for (const link of $links) {
    const src = $(link).attr("href");
    if (!src) {
      continue;
    }

    // 若是mp4则跳过
    if(/^https:\/\/.*yuque\.[^.]+\.com\/.*\.mp4$/.test(src)) {
      continue;
    }

    if (_.isRegExp(filter)) {
      if (!filter.test(src)) {
        continue;
      }
    }

    // ["https:", "", "yuque.com", "dtboost", "qd6g6q", "evcrbc"]
    const [protocol, white, host, group, book, page] = src.split("/");
    log("url parser", protocol, white, host, group, book, page);
    if (!group) {
      continue;
    }

    let newLink = "";

    if (page) {
      const links = page.split("#");
      newLink += `#/${links[0]}.html?anchor=${_.get(links, "[1]", '')}`;
    }

    $(link).attr("href", newLink);
  }

  // 订正链接卡片不跳转的问题
  $("div[data-lake-card=\"yuque\"]").each((index, item) => {
    $(item).find('a').attr('target', '_blank');
  });
};
