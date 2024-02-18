GitHub Actions & SQLite で定期的にスクレイピングする

## ローカルの環境構築

prisma と ts-node をグローバルにインストール

```sh
npm i -g prisma ts-node
```

package.json に記載されているライブラリをインストール

```sh
npm i
```

`prisma/schema.prisma` から型定義ファイルを生成

```sh
prisma generate
```

`prisma/schema.prisma` の内容を `prisma/database.sqlite` に適用

```sh
prisma db push
```

## SQL ファイルを出力する

:warn: ローカルでデータベースを更新して push するときは必ず実行する

```sh
sqlite3 prisma/database.sqlite .dump > prisma/database.sql
```

## スクリプトを実行

```sh
ts-node src/index.ts
```

## SQL をデータベースに適用

```sh
sqlite3 prisma/database.sqlite < prisma/database.sql
```

## データを見る

まずは GitHub に保存されている最新データを取得する

```sh
git pull
```

データは zip ファイルに分散して保存されているので、解凍して SQLite に集める

```sh
ts-node src/extract.ts
```

SQLite の中に入って、SQL で分析できる

```sh
# SQLite のバイナリを開く
sqlite3 prisma/schema.sqlite

# 出力をタブに
sqlite> .mode tabs

# SQL
sqlite> SELECT * FROM Wikipedia;

# 抜ける
sqlite> .quit
```
