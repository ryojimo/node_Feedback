/**
 * @fileoverview アプリケーション UI
 * @author       Ryoji Morita
 * @version      0.0.1
*/
var sv_ip   = "feedback.rp.lfx.sony.co.jp"; // node.js server の IP アドレス
//var sv_ip = "43.2.100.158";               // node.js server の IP アドレス
//var sv_ip = "192.168.91.11";              // node.js server の IP アドレス
var sv_port = 5000;                         // node.js server の port 番号

var server = io.connect( "http://" + sv_ip + ":" + sv_port ); //ローカル


//-----------------------------------------------------------------------------
// ブラウザオブジェクトから受け取るイベント
window.onload = function(){
  console.log( "[app.js] window.onloaded" );
};


window.onunload = function(){
  console.log( "[app.js] window.onunloaded" );
};


//-----------------------------------------------------------------------------
// サーバから受け取るイベント
server.on( 'connect', function(){               // 接続時
  console.log( "[app.js] " + 'connected' );
});


server.on( 'disconnect', function( client ){    // 切断時
  console.log( "[app.js] " + 'disconnected' );
});


server.on( 'S_to_C_DATA', function( data ){
  console.log( "[app.js] " + 'S_to_C_DATA' );
  console.log( "[app.js] data = " + data.value );
//  window.alert( "コマンドを送信しました。\n\r" + data.value );
});


server.on( 'S_to_C_TALK_ENABLED', function( data ){
  console.log( "[app.js] " + 'S_to_C_TALK_ENABLED' );
  console.log( "[app.js] data = " + data.value );
  flg_talk = true;
//  window.alert( "コマンドを送信しました。\n\r" + data.value );
});


server.on( 'S_to_C_START_TALK', function( data ){
  console.log( "[app.js] " + 'S_to_C_START' );
  flg_talk = true;
  sendTalkData();
});


server.on( 'S_to_C_START_MIC', function( data ){
  console.log( "[app.js] " + 'S_to_C_START_MIC' );
  submitMicStart();
});


server.on( 'S_to_C_CMNT_TODAY', function( data ){
  console.log( "[app.js] " + 'S_to_C_CMNT_TODAY' );
  console.log( "[app.js] data = " + JSON.stringify(data.value) );
  showUpdatedCmnt( data.value, "val_data_today", "down" );
});


server.on( 'S_to_C_CMNT_ONE_DAY', function( data ){
  console.log( "[app.js] " + 'S_to_C_CMNT_ONE_DAY' );
  console.log( "[app.js] data = " + JSON.stringify(data.value) );

  if( data.value == false ){
    str = "コメントがありません。";
    document.getElementById( "val_data_daily" ).innerHTML = str;
  } else{
    showUpdatedCmnt( data.value, "val_data_daily", "up" );
  }
});


server.on( 'S_to_C_TALK_CB', function(){
  console.log( "[app.js] " + 'S_to_C_TALK_CB' );
//    window.alert( "play  ****.wav が完了しました。\n\r" );
  submitMicStart();
});


//-------------------------------------
/**
 * 引数のコメントを指定した id に表示する
 * @param {string} data - コメントの文字列
 * @param {string} id - コメントを表示する先の id
 * @param {string} dir - "up" or "down"
 * @return {void}
 * @example
 * showUpdatedCmnt( data, "val_data_today", "down" );
*/
function showUpdatedCmnt( data, id, dir ){
  console.log( "[app.js] showUpdatedCmnt()" );
  console.log( "[app.js] data = " + JSON.stringify(data) );
  console.log( "[app.js] id   = " + id );
  console.log( "[app.js] dir  = " + dir );

  console.log( "[app.js] data.length = " + data.length );

  // 表示する文字列を生成
  var str = "";

  if( dir === "up" ){
    for( i=0; i<data.length; i++ ){
      str += data[i].time + " : " + data[i].cmnt + "\n";
    }
  } else if( dir === "down" ){
    for( i=data.length - 1; i>=0; i-- ){
      str += data[i].time + " : " + data[i].cmnt + "\n";
    }
  } else{
    str = "";
  }

  // 文字列を表示
  document.getElementById( id ).innerHTML = str;
}


//-----------------------------------------------------------------------------
// ドキュメント・オブジェクトから受け取るイベント
var flg_talk = true;
document.onmousemove = function(){
  console.log( "[app.js] document.onmousemove" );

  // flg_talk が true の時だけ、しゃべることが可能。
  if( flg_talk == true ){
    sendTalkData();
    flg_talk = false;
  }
};


//-----------------------------------------------------------------------------
/**
 * 指定した 1 日の、全コメントを取得するためのコマンドを送る。
 * @param {void}
 * @return {void}
 * @example
 * sendGetCmntOneDay();
*/
function sendGetCmntOneDay(){
  console.log( "[app.js] sendGetCmntOneDay()" );

  var date = document.getElementById( "val_date" ).value;
  console.log( "[app.js] date =" + date );

  if( date < "2018-08-01" ){
    alert( "2018/08/01 以降を指定してください。" );
  }

  console.log( "[app.js] server.emit(" + 'C_to_S_GET_CMNT_ONE_DAY' + ")" );
  server.emit( 'C_to_S_GET_CMNT_ONE_DAY', date );
}


/**
 * Set コマンドを送る。
 * @param {string} cmd - コマンドの文字列
 * @return {void}
 * @example
 * sendUSBKey( 'sudo ./board.out usbkey 0x3E' );
*/
function sendSetCmd( cmd ){
  console.log( "[app.js] sendSetCmd()" );
  console.log( "[app.js] cmd = " + cmd );

  console.log( "[app.js] server.emit(" + 'C_to_S_SET' + ")" );
  server.emit( 'C_to_S_SET', cmd );
}


/**
 * コメントのデータを送信する
 * @param {void}
 * @return {void}
 * @example
 * sendCmnt();
*/
function sendCmnt(){
  console.log( "[app.js] sendCmnt()" );

  // データをチェック
  var area = "";
  for( i = 1; i <= 7; i++ ){
    var where = document.getElementById( "val_area" + i ).checked;
    console.log( "[app.js] (i, area)", i, where );
    if( where === true ){
      area = area + i + "" + ",";
    }
  }

  var gid  = document.getElementById( "val_gid" );
  var cmnt = document.getElementById( "val_cmnt" );

  if( gid.value == "" ){
    gid.value = 0;
  }

  var data = { area:"", gid:"", cmnt:"" };
  data.area = area;
  data.gid  = gid.value;
  data.cmnt = cmnt.value;

  // サーバーへデータを送信
  if( cmnt.value == "" ){
    alert( "ご要望・ご意見を記入してください。" );
  } else{
    console.log( "[app.js] server.emit(" + 'C_to_S_CMNT' + ")" );
    server.emit( 'C_to_S_CMNT', data );
  }

  // データをクリア
  clearCmnt();
}


/**
 * コメントのデータをクリアする
 * @param {void}
 * @return {void}
 * @example
 * clearCmnt();
*/
function clearCmnt(){
  console.log( "[app.js] clearCmnt()" );
  var cmnt = document.getElementById( "val_cmnt" );
  cmnt.value = "";

  for( i = 1; i <= 7; i++ ){
    document.getElementById( "val_area" + i ).checked = false;
  }

  var gid  = document.getElementById( "val_gid" );
  gid.value = "";
}


/**
 * しゃべる文字データを送る。
 * @param {void}
 * @return {void}
 * @example
 * sendTalkData();
*/
function sendTalkData(){
  console.log( "[app.js] sendTalkData()" );

  var hi1 = "ご意見の記入をお願いします。"
  var hi2 = "どうぞ。";

  console.log( "[app.js] server.emit(" + 'C_to_S_TALK' + ")" );
  server.emit( 'C_to_S_TALK', hi1 + hi2 );
}


/**
 * Mic 入力 / 停止
 * @param {void}
 * @return {void}
 * @example
 * submitMicStart(); / submitMicStop();
*/
window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
var recognition = new webkitSpeechRecognition();
recognition.lang = 'ja';


// 録音終了時トリガー
recognition.addEventListener( 'result', function(event){
    var text = event.results.item(0).item(0).transcript;
    console.log( "[app.js] text = " + text );
    $("#val_cmnt").val( text );
}, false );


function submitMicStart(){
  console.log( "[app.js] submitMicStart()" );
  recognition.start();
}


function submitMicStop(){
  console.log( "[app.js] submitMicStop()" );
  recognition.stop();
}


