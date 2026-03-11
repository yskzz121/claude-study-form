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

// 通知先メールアドレス
var NOTIFY_EMAIL = 'contact@u-and-i.co.jp';

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // JSON送信とフォーム送信の両方に対応
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    data = e.parameter;
  }

  // スプレッドシートに保存
  sheet.appendRow([
    data.timestamp,
    data.name,
    data.email,
    data.affiliation,
    data.experience,
    data.expectations,
    data.remarks
  ]);

  // メール通知
  var subject = '【Claude勉強会】新規申し込み: ' + data.name + ' 様';
  var body = [
    'Claude勉強会に新しい申し込みがありました。',
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    '■ お名前: ' + data.name,
    '■ メールアドレス: ' + data.email,
    '■ 所属・職種: ' + (data.affiliation || '未記入'),
    '■ Claude利用経験: ' + data.experience,
    '■ 知りたいこと: ' + (data.expectations || '未記入'),
    '■ 備考: ' + (data.remarks || '未記入'),
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    '送信日時: ' + data.timestamp,
    '',
    '※ このメールはClaude勉強会申し込みフォームから自動送信されています。'
  ].join('\n');

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

  // 応募者への確認メール
  var replySubject = '【Claude勉強会】お申し込みありがとうございます';
  var replyBody = [
    data.name + ' 様',
    '',
    'Claude勉強会へのお申し込みありがとうございます。',
    '以下の内容で受け付けいたしました。',
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    '■ お名前: ' + data.name,
    '■ メールアドレス: ' + data.email,
    '■ 所属・職種: ' + (data.affiliation || '未記入'),
    '■ Claude利用経験: ' + data.experience,
    '■ 知りたいこと: ' + (data.expectations || '未記入'),
    '■ 備考: ' + (data.remarks || '未記入'),
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    '勉強会の詳細につきましては、追ってご連絡いたします。',
    'ご不明な点がございましたら、お気軽にご連絡ください。',
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '主催: U&I',
    'お問い合わせ: contact@u-and-i.co.jp',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    '※ このメールは自動送信されています。'
  ].join('\n');

  MailApp.sendEmail(data.email, replySubject, replyBody);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// GETリクエストにも対応（バックアップ）
function doGet(e) {
  return doPost(e);
}
