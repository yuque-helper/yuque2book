export interface YuqueInstance {
  url: string;
  origin: string;
  namespace?: string;
  slug?: string;
  name?: string;      // 仓库的名字
}

export interface Toc {
  title: string;
  slug: string;
  depth: string;
}

export interface Doc{
  abilities: {
    update?: boolean;
    destroy?: boolean;
  },
  data: {
    id: number;
    type: string;
    slug: string;
    title: string;
    book_id: string;
    format: string;
    body: string;
    body_html: string;
    public: number;
  }
}