# Epic Seven JSON generator

エピックセブンの英雄データのJSONを生成するツールです

生成結果のみが必要な場合、以下にあるJSONファイルをそのまま使ってください

<pre>
doc/[lang]/[英雄名].json
</pre>

※現在[ja(日本語)]のみ生成に対応しています。

# WEB API 風

生成したJSONファイルはgithub.ioで公開しているのでWEB API風に参照できます

その場合は以下のようなURLでアクセス可能です

http://fmnb0516.github.io/epicseven-json-generator/[lang]/[英雄名].json

例えば日本語環境でアンジェリカのJSONデータを取得する場合は以下になります

<pre>
http://fmnb0516.github.io/epicseven-json-generator/ja/アンジェリカ.json
</pre>
※url encodeは適時行ってください

ちなみに取得できるJSONの一覧は以下のJSONで定義されています

<pre>
http://fmnb0516.github.io/epicseven-json-generator/[lang]/_heros.json
</pre>

上記はこんな感じで定義されてます

<pre>
[
	"チェルミア.json",
	"生徒会広報ヘイゼル.json",
	"飼い猫クラリッサ.json",
	"実験体セズ.json",
	"鷹狩のクルリ.json",
	"暗殺者シダー.json",
    ・・・
]
</pre>

# WEB Viewer

生成したJSONのデータを確認するための簡単なViewerも公開しています

<pre>
http://fmnb0516.github.io/epicseven-json-generator/
</pre>

上記にブラウザでアクセスすると自動的にブラウザの言語に対応したページに遷移します。

見方とかはページ見れば分かると思います

# ローカルでの生成

以下のコマンドでjsonファイルが生成されます

<pre>
#node index.js [lang]
</pre>

引数の[lang]を省略した場合、日本語環境(ja)のJSONが生成されます

生成されたファイルは以下に作られます。

<pre>
doc/[lang]/ ・・・ .json
</pre>

# その他補足

TODO