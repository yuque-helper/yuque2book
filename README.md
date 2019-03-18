# yuque2book
English  |  [中文](https://github.com/yuque-helper/yuque2book/wiki/%E8%AF%AD%E9%9B%80%E6%96%87%E6%A1%A3%E5%B7%A5%E5%85%B7)

convert yuque repo to a book

## Quick Start

```bash
$ npm install yuque2book -g
$ yuque2book -t your_token https://www.yuque.com/yuque/help

# [optional]
# you need a staic server cli to preview your doc 
$ npm install anywhere -g
$ cd yuque_help && anywhere # you will see your doc
```

## Usage

```
Usage: yuque2book [options]

Options:
  -V, --version    output the version number
  -t, --token <n>  your yuque token 你的语雀token
  -l, --local      to localize image and attach
  -h, --help       output usage information
```

## demo

![](https://raw.githubusercontent.com/yuque-helper/yuque2book/master/doc/yuque2book.gif)


## preview

![image](https://user-images.githubusercontent.com/16508727/54540564-23db1c00-49d3-11e9-87d2-b35e230a6151.png)

## Q&A

- what's your_token or yuque token?
- yuque api needs you personal token, you can find at [https://www.yuque.com/settings/tokens](https://www.yuque.com/settings/tokens)
