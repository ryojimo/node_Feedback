/**
 * @fileoverview メイン・システム
 * @author       Ryoji Morita
 * @version      0.0.1
*/

// 必要なライブラリをロード
let http     = require('http');
let socketio = require('socket.io');
let fs       = require('fs');
let colors   = require('colors');
require('date-utils');

const DataCmnts   = require('./js/DataCmnts');
const Docomo      = require('./js/Docomo');


// Ver. 表示
let now = new Date();
console.log("[main.js] " + now.toFormat("YYYY年MM月DD日 HH24時MI分SS秒").rainbow);
console.log("[main.js] " + "ver.01 : app.js".rainbow);
console.log("[main.js] " + "access to http://localhost:5000");

// サーバー・オブジェクトを生成
let server = http.createServer();

// request イベント処理関数をセット
server.on('request', doRequest);

// 待ち受けスタート
server.listen(process.env.VMC_APP_PORT || 5000);
console.log("[main.js] Server running!");

// request イベント処理
function doRequest(
  req,    // http.IncomingMessage オブジェクト : クライアントからのリクエストに関する機能がまとめられている
  res     // http.serverResponse  オブジェクト : サーバーからクライアントへ戻されるレスポンスに関する機能がまとめられている
){
  switch(req.url) {
  case '/':
    fs.readFile('./app/app.html', 'UTF-8', function(err, data) {
      if(err) {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.write('File Not Found.');
        res.end();
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/html',
                          'Access-Control-Allow-Origin': '*'
                   });
      res.write(data);
      res.end();
    });
  break;
  case '/app.js':
    fs.readFile('./app/app.js', 'UTF-8', function(err, data) {
      res.writeHead(200, {'Content-Type': 'application/javascript',
                          'Access-Control-Allow-Origin': '*'
                   });
      res.write(data);
      res.end();
    });
  break;
  case '/style.css':
    fs.readFile('./app/style.css', 'UTF-8', function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/css',
                          'Access-Control-Allow-Origin': '*'
                   });
      res.write(data);
      res.end();
    });
  break;
  case '/AreaMap.png':
    fs.readFile('./app/AreaMap.png', 'binary', function(err, data) {
      res.writeHead(200, {'Content-Type': 'image/png',
                           'Access-Control-Allow-Origin': '*'
                    });
      res.write(data, 'binary');
      res.end();
    });
  break;
  }
}


let io = socketio.listen(server);


//-----------------------------------------------------------------------------
// 起動の処理関数
//-----------------------------------------------------------------------------
let timerDist;
let timerFlg;

let cmnts   = new DataCmnts();
let docomo  = new Docomo();


startSystem();


/**
 * システムを開始する
 * @param {void}
 * @return {void}
 * @example
 * startSystem();
*/
function startSystem() {
  console.log("[main.js] startSystem()");

//  timerDist = setInterval(checkDist, 2000);
  timerFlg  = setInterval(function() {
                io.sockets.emit('S_to_C_TALK_ENABLED', {value:false});
              }, 90000);
};


//-----------------------------------------------------------------------------
// クライアントからコネクションが来た時の処理関数
//-----------------------------------------------------------------------------
io.sockets.on('connection', function(socket) {

  // 切断したときに送信
  socket.on('disconnect', function() {
    console.log("[main.js] " + 'disconnect');
//  io.sockets.emit('S_to_C_DATA', {value:'user disconnected'});
  });


  // Client to Server
  socket.on('C_to_S_NEW', function(data) {
    console.log("[main.js] " + 'C_to_S_NEW');
  });


  socket.on('C_to_S_DELETE', function(data) {
    console.log("[main.js] " + 'C_to_S_DELETE');
  });


  socket.on('C_to_S_GET_CMNT_ONE_DAY', function(date) {
    console.log("[main.js] " + 'C_to_S_GET_CMNT_ONE_DAY');

    cmnts.GetMDDocDataOneDay(date, function(err, data) {
//      console.log(data);
      io.sockets.emit('S_to_C_CMNT_ONE_DAY', {ret:err, value:data});
    });
  });


  socket.on('C_to_S_SET', function(data) {
    console.log("[main.js] " + 'C_to_S_SET');
    console.log("[main.js] data = " + data);

    let exec = require('child_process').exec;
    let ret  = exec(data, function(err, stdout, stderr) {
      console.log("[main.js] stdout = " + stdout);
      console.log("[main.js] stderr = " + stderr);
      if(err) {
        console.log("[main.js] " + err);
      }
    });
  });


  socket.on('C_to_S_CMNT', function(data) {
    console.log("[main.js] " + 'C_to_S_CMNT');
    console.log("[main.js] data = " + data);

    let data = {date:yyyymmdd(), time: hhmmss(), area: data.area, gid: data.gid, cmnt: data.cmnt};

    console.log("[main.js] data.date = " + data.date);
    console.log("[main.js] data.time = " + data.time);
    console.log("[main.js] data.area = " + data.area);
    console.log("[main.js] data.gid  = " + data.gid);
    console.log("[main.js] data.cmnt = " + data.cmnt);

    cmnts.CreateMDDoc(data);

    cmnts.GetMDDocDataOneDay(yyyymmdd(), function(err, data) {
//      console.log(data);
      io.sockets.emit('S_to_C_CMNT_TODAY', {value:data});
    });
  });


  socket.on('C_to_S_TALK', function(cmnt) {
    console.log("[main.js] " + 'C_to_S_TALK');
    console.log("[main.js] cmnt = " + cmnt);

    docomo.Update('nozomi', 'hello');
    docomo.Talk(cmnt, function() {
      io.sockets.emit('S_to_C_TALK_CB', {value:true})
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
  console.log("[main.js] checkDist()");

  let exec = require('child_process').exec;
  let ret  = exec("sudo ./board.out dist",
    function(err, stdout, stderr) {
      console.log("[main.js] " + "stdout = " + stdout);
      console.log("[main.js] " + "stderr = " + stderr);

      if(err) {
        console.log("[main.js] " + err);
      } else if(stdout < 20) {
        // 一旦、繰り返し処理を呼ぶのをやめる
        // 10sec 後に Mic 入力開始
        // 20sec 後に startSystem() を再び呼び出し始める
        clearInterval(timerDist);
        clearInterval(timerFlg);

        io.sockets.emit('S_to_C_START_TALK', {value:false});

        setTimeout(function() {
                io.sockets.emit('S_to_C_START_MIC', {value:false});
              }, 10000);
        setTimeout(startSystem, 30000);
      }
    });
};


/**
 * 数字が 1 桁の場合に 0 埋めで 2 桁にする
 * @param {number} num - 数値
 * @return {number} num - 0 埋めされた 2 桁の数値
 * @example
 * toDoubleDigits(8);
*/
let toDoubleDigits = function(num) {
//  console.log("[main.js] toDoubleDigits()");
//  console.log("[main.js] num = " + num);
  num += '';
  if(num.length === 1) {
    num = '0' + num;
  }
  return num;
};


/**
 * 現在の日付を YYYY-MM-DD 形式で取得する
 * @param {void}
 * @return {string} day - 日付
 * @example
 * yyyymmdd();
*/
let yyyymmdd = function() {
  console.log("[main.js] yyyymmdd()");
  let date = new Date();

  let yyyy = date.getFullYear();
  let mm   = toDoubleDigits(date.getMonth() + 1);
  let dd   = toDoubleDigits(date.getDate());

  let day = yyyy + '-' + mm + '-' + dd;
  console.log("[main.js] day = " + day);
  return day;
};


/**
 * 現在の時刻を HH:MM:SS 形式で取得する
 * @param {void}
 * @return {string} time - 時刻
 * @example
 * hhmmss();
*/
let hhmmss = function() {
  console.log("[main.js] hhmmss()");
  let date = new Date();

  let hour = toDoubleDigits(date.getHours());
  let min  = toDoubleDigits(date.getMinutes());
  let sec  = toDoubleDigits(date.getSeconds());

  let time = hour + ':' + min + ':' + sec;
  console.log("[main.js] time = " + time);
  return time;
};


