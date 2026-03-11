// =============================================
// Google Apps Script（GAS）— スプレッドシート連携
// =============================================
//
// 【セットアップ手順】
//
// 1. 個人Gmailアカウント（@gmail.com）でGoogle スプレッドシートを新規作成
//    ※ Google Workspaceアカウントでは外部公開に制限がかかる場合あり
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
//    → 承認画面で「詳細」→「（安全ではないページ）に移動」→「許可」
//    → デプロイして表示されるURLをコピー
//
// 5. index.html の SCRIPT_URL にそのURLを貼り付け
//
// 6. curl でGETテストを行い {"result":"ok","message":"フォームAPIは稼働中です"} が
//    返ることを確認してからリリースする
//
// =============================================

// 通知先メールアドレス
var NOTIFY_EMAIL = 'contact@u-and-i.co.jp';

function processData(data) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    if (!data || !data.name || !data.email) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: 'error', message: 'データが不足しています' }))
        .setMimeType(ContentService.MimeType.JSON);
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

    // 管理者への通知メール
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

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GETリクエスト: フォームからの送信（URLパラメータ）+ ヘルスチェック
function doGet(e) {
  if (e.parameter && e.parameter.name) {
    return processData(e.parameter);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'ok', message: 'フォームAPIは稼働中です' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// POSTリクエスト: JSON / フォーム両対応（バックアップ）
function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    data = e.parameter;
  }
  return processData(data);
}
