# API 设计

## 一、接口标准

### 请求格式

### 返回格式

- code 数字，0 为成功
- msg 字符串，错误描述
- data json，返回的数据

## 二、模块设计

## 1. Note 模块

用来给前端建立文档树，以及获取文档的具体内容，全部使用 post 接口。

封装 siyuan-kernel 相关的接口进行实现

siyuan-kernel api 的 标准返回格式:

- code 数字，0 为成功
- msg 字符串，错误描述
- data json，返回的数据

### 1.1 数据结构

#### 1.1.1 笔记本 NoteBook

笔记本下只能有 doc，可以理解为「文件夹」

- id 思源的块 id
- name 名
- sort
- sortMode
- icon

#### 1.1.2. 文档 Doc

文档可以有子文档，也可以有具体的内容，可以理解为既可以是「文件夹」，也可以是「文件」，或者同时都是：
- 假如 subFileCount 为 0，则可以认为是「文件」
- 假如 subFileCount 大于 0，则可以认为是「文件夹」且「文件」

注意这里说的「文件」，指的是笔记，即 markdown 笔记。

- id 思源的块 id
- path 路径
- name 名
- sort
- icon

- mtime: 1750702616,
- ctime: 1750693011,
- hMtime: "2025-06-24 02:16:56, 3 个星期前",
- hCtime: "2025-06-23 23:36:51, 3 个星期前",
- subFileCount 子文件的数量（如果为 0）

#### 1.1.3. Note 文档内容

- id Note 区块的内容
- content 内容（html 字符串）
- path 完整路径，可能为 {笔记本}/{ParentDoc}/{当前Doc}

### 1.2 API 设计

#### 1.2.1 获取所有笔记本

- api: notebooks
- 描述：调用 siyuan 的 `notebook/lsNotebooks` 获取根目录的所有笔记本；
- 返回值：将 siyuan 返回的数据，封装成数据结构中的 NoteBook 数据 （经过测试，字段名相同）

#### 1.2.2. 获取所有文档

- api：docs
- 描述：调用 siyuan 的 `filetree/listDocsByPath` 获取所有的 docs，可筛选
- 参数：
    - notebook，「NoteBook」结构体的 id 字段（透传入到 siyuan-api）
    - path 路径，获取子 doc 的时候，需要传入父 doc 的 「path」字段。如果希望获取「NoteBook」根目录的所有子文档，则传入 "/"（透传入到 siyuan-api）
- 返回值：将 siyuan 返回的数据，封装成数据结构中的 Doc 数据 （经过测试，字段名相同）

#### 1.2.3. 获取 Doc 内容

- api：doc
- 描述：调用 siyuan 的 `/api/filetree/getDoc`，获取文档内容
- 参数
    - id：docs 接口返回的 doc 的 id 字段 （透传入到 siyuan-api）
- 返回将 siyuan 返回的数据，封装成数据结构中的 Note 数据 （经过测试，字段名相同）

#### 1.2.4. 获取推荐文章

- api：recommended
- 描述：获取推荐文章列表，目前采用随机获取的方式
- 参数：
    - count：可选参数，推荐文章数量，默认为10
- 返回值：随机选择的文档列表，返回 Doc 数据结构的数组
- 实现逻辑：
    1. 获取所有笔记本
    2. 遍历所有笔记本，获取其下的所有文档
    3. 过滤掉子文档数量大于0的文档（只返回真正的文章，不返回目录）
    4. 从所有文章中随机选择指定数量的文章返回

## 2. AboutMe 模块

### 2.1 数据结构

- name
- avatarUrl
- bio

### 2.2 接口设计

获取我的信息