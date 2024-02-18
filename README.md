GitHub Actions & SQLite で定期的にスクレイピングする

# カスタマイズ

`.github/workflows/cron.yml` を編集して動作をカスタマイズできます。

- `on.schedule.cron` : cron 式で実行間隔を設定できます。
- `env.INTERVAL_UNIT` : 実行の間隔の単位を設定します。次の 6 項目から選択できます。
  - year : 毎年
  - month : 毎月
  - date : 毎日
  - hour : 毎時
  - minute : 毎分
  - second : 毎秒

`INTERVAL_UNIT` は、その単位内で複数回プログラムが実行しても冪等であることを保証するものです。例えば、`INTERVAL_UNIT` を `date` に設定した場合、主キーは `2024-02-18` のようになり、1 日のうちに何回実行されてもデータが複数回登録されることはありません。

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

---

# 開発者向け

## ローカルの環境構築

prisma と ts-node をグローバルにインストール

```sh
npm i -g prisma ts-node
```

package.json に記載されているライブラリをインストール

```sh
npm i
```

## Prisma

`prisma/schema.prisma` から型定義ファイルを生成

```sh
prisma generate
```

`prisma/schema.prisma` の内容を `prisma/database.sqlite` に適用

```sh
prisma db push
```

## スクリプトを実行

```sh
ts-node src/index.ts
```
