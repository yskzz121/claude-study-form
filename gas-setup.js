// =============================================
// Google Apps Script（GAS）— スプレッドシート連携
// =============================================
//
// 【セットアップ手順】
//
// 1. Google スプレッドシートを新規作成
//    → 1行目にヘッダーを入力:
//      タイムスタンプ | お名前 | メールアドレス | 所属・職種 | Claude利用経験 | 知りたいこと | 備考
//
// 2. メニュー「拡張機能」→「Apps Script」を開く
//
// 3. 以下のコードを貼り付けて保存
//
// 4. 「デプロイ」→「新しいデプロイ」
//    - 種類: ウェブアプリ
//    - 実行ユーザー: 自分
//    - アクセス: 全員
//    → デプロイして表示されるURLをコピー
//
// 5. index.html の SCRIPT_URL にそのURLを貼り付け
//
// =============================================

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.timestamp,
    data.name,
    data.email,
    data.affiliation,
    data.experience,
    data.expectations,
    data.remarks
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
