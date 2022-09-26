// import * as os from 'os';
import * as path from "path";
import * as fs from "fs-extra";
import Yuque from "yuque-api";

import { Doc, Toc, YuqueInstance } from "../interface";
import {localize} from "./localize";
import {parseUrl} from "./util";

const tempDir = process.cwd() || ".";

const yuque2book = async (token: string, url: string, local: boolean = false) => {
  const instance = parseUrl(url);
  const yuque = new Yuque(token, {url: instance.origin });

  if (!instance.namespace || !instance.name) {
    throw Error("没有选择文档仓库");
  }

  // 遍历目录树
  const dir = path.join(tempDir, instance.name);
  await fs.ensureDir(dir);

  const dataDir = path.join(dir, "json");
  const searchDir = path.join(dir, "search");

  await getSaveDetail(yuque, instance, dataDir);
  const toc = await getAndSaveToc(yuque, instance, dataDir);
  await getAndSaveDoc(toc, yuque, instance, dataDir, searchDir);

  // 本地化图片, 资源
  if (local) {
    await localize(dataDir, dataDir, token);
    // TODO: 需要重构一下代码
    try {
      await fs.move(path.join(dataDir, "img"), path.join(dir, "img"));
      await fs.move(path.join(dataDir, "attach"), path.join(dir, "attach"));
    } catch (e) {
      // tslint:disable-next-line
      console.log("移动文件失败", e);
    }
  }

  await moveFrontEnd(dir);
};

const getSaveDetail = async (yuque: Yuque, instance: YuqueInstance, dir: string) => {
  if (!instance.namespace || !instance.name) {
    throw Error("没有选择文档仓库");
  }

  const detail = await yuque.repo(instance.namespace).detail();

  const bookJsonPath = path.join(dir, "book.json");
  await fs.ensureFile(bookJsonPath);

  const {name, description, slug} = detail.data;

  await fs.writeFile(bookJsonPath, JSON.stringify(
    {
      description, name, slug,
    },
  ));
};

const getAndSaveToc = async (yuque: Yuque, instance: YuqueInstance, dir: string): Promise<Toc[]> => {

  if (!instance.namespace || !instance.name) {
    throw Error("没有选择文档仓库");
  }

  // 获取yuque的目录树, 存储成为toc.json
  let result: any = null;
  try {
    result = await yuque.repo(instance.namespace).toc();
  } catch (e) {
    // console.error(e);
    throw Error("获取目录树失败");
  }

  if (!result) {
    throw Error("获取目录树失败");
  }

  const toc = result.data;

  await fs.ensureDir(dir);

  const tocFile = path.join(dir, "toc.json");

  await fs.ensureFile(tocFile);

  await fs.writeFile(tocFile, JSON.stringify(toc, null, 2));

  return toc;
}; 

const getAndSaveDoc = async (toc: Toc[], yuque: Yuque, instance: YuqueInstance, dir: string, searchDir: string) => {
  if (!instance.namespace || !instance.name) {
    throw Error("没有选择文档仓库");
  }

  for (const doc of toc) {
    if (doc.slug === "#") {
      continue;
    }

    try {
      const docBody: Doc = await yuque.repo(instance.namespace).doc(doc.slug);
      const docPath = path.join(dir, doc.slug + ".json");
      await fs.ensureFile(docPath);

      await fs.writeFile(docPath, JSON.stringify(
        {
          body_html: docBody.data.body_html,
          slug: docBody.data.id,
          title: docBody.data.title,
        },
        null,
        2,
      ));
       // tslint:disable-next-line
      console.log("获取文档: %s 成功, slug: %s", doc.title, doc.slug);
    } catch (e) {
       // tslint:disable-next-line
      console.error("获取文档: %s 失败, slug: %s", doc.title, doc.slug);
    }
  }
};

const moveFrontEnd = async (dir: string) => {
  const frontDist = path.join(__dirname, "..", "..", "front-end");
  const target = dir;
  await fs.copy(frontDist, target);
  const toMoveDir = ['json', 'search', 'img', 'attach'];
  await fs.ensureDir(path.join(dir, 'data'));
  for(let md of toMoveDir){
    if(fs.existsSync(path.join(dir, md))){
      await fs.move(path.join(dir, md), path.join(dir, 'data', md))
    }
  }
};

export default yuque2book;
