/**
 * @fileoverview メイン・システム
 * @author       Ryoji Morita
 * @version      0.0.1
*/

// 必要なライブラリをロード
var http     = require( 'http' );
var socketio = require( 'socket.io' );
var fs       = require( 'fs' );
var colors   = require( 'colors' );
require( 'date-utils' );

const DataCmnt   = require( './js/DataCmnt' );
const DataPerson = require( './js/DataPerson' );
const DataSensor = require( './js/DataSensor' );
const Docomo     = require( './js/Docomo' );
const PlayMusic  = require( './js/PlayMusic' );


// Ver. 表示
var now = new Date();
console.log( "[main.js] " + now.toFormat("YYYY年MM月DD日 HH24時MI分SS秒").rainbow );
console.log( "[main.js] " + "ver.01 : app.js".rainbow );
console.log( "[main.js] " + "access to http://localhost:5000" );

// サーバー・オブジェクトを生成
var server = http.createServer();

// request イベント処理関数をセット
server.on( 'request', doRequest );

// 待ち受けスタート
server.listen( process.env.VMC_APP_PORT || 5000 );
console.log( "[main.js] Server running!" );

// request イベント処理
function doRequest(
  req,    // http.IncomingMessage オブジェクト : クライアントからのリクエストに関する機能がまとめられている
  res     // http.serverResponse  オブジェクト : サーバーからクライアントへ戻されるレスポンスに関する機能がまとめられている
){
  switch( req.url ){
  case '/':
    fs.readFile( './app/app.html', 'UTF-8',
      function( err, data ){
        if( err ){
          res.writeHead( 404, {'Content-Type': 'text/html'} );
          res.write( 'File Not Found.' );
          res.end();
          return;
        }
        res.writeHead( 200, {'Content-Type': 'text/html',
                             'Access-Control-Allow-Origin': '*'
                      } );
        res.write( data );
        res.end();
      }
    );
  break;
  case '/app.js':
    fs.readFile( './app/app.js', 'UTF-8',
      function( err, data ){
        res.writeHead( 200, {'Content-Type': 'application/javascript',
                             'Access-Control-Allow-Origin': '*'
                      } );
        res.write( data );
        res.end();
      }
    );
  break;
  case '/style.css':
    fs.readFile( './app/style.css', 'UTF-8',
      function( err, data ){
        res.writeHead( 200, {'Content-Type': 'text/css',
                             'Access-Control-Allow-Origin': '*'
                      } );
        res.write( data );
        res.end();
      }
    );
  break;
  case '/AreaMap.png':
    fs.readFile( './app/AreaMap.png', 'binary',
      function( err, data ){
        res.writeHead( 200, {'Content-Type': 'image/png',
                             'Access-Control-Allow-Origin': '*'
                      } );
        res.write( data, 'binary' );
        res.end();
      }
    );
  break;
  }
}


var io = socketio.listen( server );


//-----------------------------------------------------------------------------
// 起動の処理関数
//-----------------------------------------------------------------------------
var timerDist;
var timerFlg;

var cmnt    = new DataCmnt();
var docomo  = new Docomo();


startSystem();


/**
 * システムを開始する
 * @param {void}
 * @return {void}
 * @example
 * startSystem();
*/
function startSystem() {
  console.log( "[main.js] startSystem()" );

  timerDist = setInterval( checkDist, 2000 );
  timerFlg  = setInterval( function(){
                io.sockets.emit( 'S_to_C_TALK_REPLY', {value:false} );
              }, 90000 );
};


//-----------------------------------------------------------------------------
// クライアントからコネクションが来た時の処理関数
//-----------------------------------------------------------------------------
io.sockets.on( 'connection', function( socket ){

  // 切断したときに送信
  socket.on( 'disconnect', function(){
    console.log( "[main.js] " + 'disconnect' );
//  io.sockets.emit("S_to_C_DATA", {value:"user disconnected"});
  });


  // Client to Server
  socket.on( 'C_to_S_NEW', function( data ){
    console.log( "[main.js] " + 'C_to_S_NEW' );
  });


  socket.on( 'C_to_S_DELETE', function( data ){
    console.log( "[main.js] " + 'C_to_S_DELETE' );
  });


  socket.on( 'C_to_S_GET_CMNT_ONE_DAY', function( data ){
    console.log( "[main.js] " + 'C_to_S_GET_CMNT_ONE_DAY' );

    var file = 'data/' + data + '_cmnt.txt';
    console.log( "[main.js] file: " + file );
    var ret = cmnt.ReadFile( file );

    io.sockets.emit( 'S_to_C_CMNT_ONE_DAY', {value:ret} );
  });


  socket.on( 'C_to_S_SET', function( data ){
    console.log( "[main.js] " + 'C_to_S_SET' );
    console.log( "[main.js] data = " + data );

    var exec = require( 'child_process' ).exec;
    var ret  = exec( data,
      function( err, stdout, stderr ){
        console.log( "[main.js] stdout = " + stdout );
        console.log( "[main.js] stderr = " + stderr );
        if( err ){
          console.log( "[main.js] " + err );
        }
      });
  });


  socket.on( 'C_to_S_CMNT', function( data ){
    console.log( "[main.js] " + 'C_to_S_CMNT' );
    console.log( "[main.js] data = " + data );

    var data = { time: hhmmss(), area: data.area, gid: data.gid, cmnt: data.cmnt };
    var file = 'data/' + yyyymmdd() + '_cmnt.txt';
    console.log( "[main.js] data.time = " + data.time );
    console.log( "[main.js] data.area = " + data.area );
    console.log( "[main.js] data.gid  = " + data.gid );
    console.log( "[main.js] data.cmnt = " + data.cmnt );
    console.log( "[main.js] file = " + file );

    cmnt.Update( data );
    cmnt.AppendFile( file );
    var ret = cmnt.ReadFile( file );

    io.sockets.emit( 'S_to_C_CMNT_TODAY', {value:ret} );
  });


  socket.on( 'C_to_S_TALK', function( cmnt ){
    console.log( "[main.js] " + 'C_to_S_TALK' );
    console.log( "[main.js] cmnt = " + cmnt );

    docomo.Update( "nozomi", "hello" );
    docomo.Talk( cmnt, function(){
      io.sockets.emit( 'S_to_C_TALK_CB', {value:true} )
    });
  });


});


/**
 * 距離センサをチェックして 30cm 以内に何かがいれば、S_to_C_START を呼ぶ
 * @param {void}
 * @return {void}
 * @example
 * yyyymmddhhmiss();
*/
function checkDist() {
  console.log( "[main.js] checkDist()" );

  var exec = require( 'child_process' ).exec;
  var ret  = exec( "sudo ./board.out dist",
    function( err, stdout, stderr ){
      console.log( "[main.js] " + "stdout = " + stdout );
      console.log( "[main.js] " + "stderr = " + stderr );

      if( err ){
        console.log( "[main.js] " + err );
      } else if( stdout < 20 ){
        // 一旦、繰り返し処理を呼ぶのをやめる
        // 10sec 後に Mic 入力開始
        // 20sec 後に startSystem() を再び呼び出し始める
        clearInterval( timerDist );
        clearInterval( timerFlg );

        io.sockets.emit( 'S_to_C_START_TALK', {value:false} );

//        setTimeout( function() {
//                io.sockets.emit( 'S_to_C_START_MIC', {value:false} );
//              }, 10000 );
        setTimeout( startSystem, 30000 );
      }
    });
};


/**
 * 数字が 1 桁の場合に 0 埋めで 2 桁にする
 * @param {number} num - 数値
 * @return {number} num - 0 埋めされた 2 桁の数値
 * @example
 * toDoubleDigits( 8 );
*/
var toDoubleDigits = function( num ){
  console.log( "[main.js] toDoubleDigits()" );
  console.log( "[main.js] num = " + num );
  num += "";
  if( num.length === 1 ){
    num = "0" + num;
  }
  return num;
};


/**
 * 現在の日付を YYYY_MM_DD 形式で取得する
 * @param {void}
 * @return {string} day - 日付
 * @example
 * yyyymmdd();
*/
var yyyymmdd = function(){
  console.log( "[main.js] yyyymmdd()" );
  var date = new Date();

  var yyyy = date.getFullYear();
  var mm   = toDoubleDigits( date.getMonth() + 1 );
  var dd   = toDoubleDigits( date.getDate() );

  var day = yyyy + '-' + mm + '-' + dd;
  console.log( "[main.js] day = " + day );
  return day;
};


/**
 * 現在の時刻を HH:MM:SS 形式で取得する
 * @param {void}
 * @return {string} time - 時刻
 * @example
 * hhmmss();
*/
var hhmmss = function(){
  console.log( "[main.js] hhmmss()" );
  var date = new Date();

  var hour = toDoubleDigits( date.getHours() );
  var min  = toDoubleDigits( date.getMinutes() );
  var sec  = toDoubleDigits( date.getSeconds() );

  var time = hour + ":" + min + ":" + sec;
  console.log( "[main.js] time = " + time );
  return time;
};
