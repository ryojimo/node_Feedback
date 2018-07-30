/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
var fs      = require( 'fs' );
var request = require( 'request' );


/**
 * Docomo class
 * @param {void}
 * @constructor
 * @example
 * var obj = new Docomo();
*/
var Docomo = function(){
  /**
   * データ
   * @type {string}
  */
  this.base_url = 'https://api.apigw.smt.docomo.ne.jp/aiTalk/v1/textToSpeech?APIKEY=';
  this.api_key = '2f332f71636e67432e556f676a7852582f77362e7264526f3139724b6556786634702e335464414f396d36';
  this.voice = 'nozomi';
  this.voice_filename = 'voice_file';
  this.cmd_pcm2wav = 'sox  -t  raw  -r  16k  -e  signed  -b  16  -B  -c  1  /media/pi/USBDATA/' + this.voice_filename + '.lpcm  /media/pi/USBDATA/' + this.voice_filename + '.wav';
  this.cmd_play_wav = 'play  /media/pi/USBDATA/' + this.voice_filename + '.wav';
  this.cmnt = '';
};


/**
 * this.voice と this.voice_filename を更新する
 * @param {string} speaker - アップデートする voice
 * @param {string} filename - ****.lpcm, ****.wav 中間ファイルのファイル名 (= **** の部分 )
 * @return {void}
 * @example
 * Update( "nozomi", "hello" );
*/
Docomo.prototype.Update = function( speaker, filename ){
  console.log( "[Docomo.js] Update()" );
  console.log( "[Docomo.js] filename = " + filename );

  this.voice = speaker;
  this.voice_filename = filename;
}


/**
 * 話す声をランダムで選択して返す
 * @param {void}
 * @return {string} voice- 話す声
 * @example
 * GetVoice();
*/
var voice =  ['nozomi', 'maki', 'reina', 'taichi',
              'sumire', 'kaho', 'akari', 'nanako',
              'seiji', 'osamu', 'hiroshi', 'anzu', 'tihiro', 'koutaro', 'yuto'
             ];

Docomo.prototype.GetVoice = function(){
  console.log( "[Docomo.js] GetVoice()" );

  var no = Math.floor( Math.random() * voice.length );
  return voice[no];
}


/**
 * cmnt の文字列を話す
 * @param {string} cmnt- 話す文字列
 * @param {function} callback- play  ****.wav した後に呼び出すコールバック関数
 * @return {void}
 * @example
 * Talk( "こんにちは" );
*/
Docomo.prototype.Talk = function( cmnt, callback ){
  console.log( "[Docomo.js] Talk()" );
  console.log( "[Docomo.js] cmnt     = " + cmnt );
//  console.log( "[Docomo.js] callback = " + callback );

  var apiBODY = makeDocomoXML( this.voice, cmnt );

  var docomoOptions = {
    uri: this.base_url + this.api_key,

    proxy: 'http://proxy.sngw.sony.co.jp:10080',    // proxy 環境の時のみ記述

    headers: {
      'Content-Type': 'application/ssml+xml',
      'Accept': 'audio/L16'
    },
    form: apiBODY,
    json: true
  };

  //リクエスト送信
  var file_lpcm = this.voice_filename + '.lpcm';
  var file_wav  = this.voice_filename + '.wav';
  var cmd_pcm2wav  = 'sox  -t  raw  -r  16k  -e  signed  -b  16  -B  -c  1  /media/pi/USBDATA/' + file_lpcm + '  /media/pi/USBDATA/' + file_wav;
  var cmd_playwav  = 'play  /media/pi/USBDATA/' + file_wav;

  console.log( "[Docomo.js] docomoOptions = " + JSON.stringify(docomoOptions) );
  var res = request.post( docomoOptions );

  res.on( 'response', function( response ){
    console.log( "[Docomo.js] response.statusCode = " + response.statusCode );
    console.log( "[Docomo.js] headers = " + response.headers['content-type'] );
  });

  res.on( 'end', function( response ){
    var exec = require( 'child_process' ).exec;

    console.log( "[Docomo.js] cmd_pcm2wav = " + cmd_pcm2wav );
    var ret  = exec( cmd_pcm2wav,
      function( err, stdout, stderr ){
//        console.log( "[Docomo.js] stdout = " + stdout );
//        console.log( "[Docomo.js] stderr = " + stderr );
        if( err ){
          console.log( "[Docomo.js] cmd_pcm2wav: " + err );
        }
      });

    console.log( "[Docomo.js] cmd_playwav = " + cmd_playwav );
    var ret  = exec( cmd_playwav,
      function( err, stdout, stderr ){
//        console.log( "[Docomo.js] stdout = " + stdout );
//        console.log( "[Docomo.js] stderr = " + stderr );
        if( err ){
          console.log( "[Docomo.js] cmd_playwav: " + err );
        }

        if( callback != undefined ){
          callback();
        }
      });
  }).pipe( fs.createWriteStream( '/media/pi/USBDATA/' + file_lpcm ) );
}


/**
 * XML 形式の HTTP Body を作る。
 * @param {string} speaker - 話者名．この中から選べる ( http://www.ai-j.jp/ )
 * @param {string} cmnt - せりふ
 * @return {string} body - HTTP Body
 * @example
 * makeDocomoXML( "nozomi", "こんにちは" );
*/
function makeDocomoXML( speaker, cmnt ){
  console.log( "[Docomo.js] makeDocomoXML()" );
  console.log( "[Docomo.js] speaker = " + speaker );
  console.log( "[Docomo.js] cmnt = " + cmnt );

  var xml = '<?xml version="1.0" encoding="utf-8" ?>';
  var speak = '<speak version="1.1">';
  var voice = '<voice name="' + speaker + '">' + cmnt + '</voice>';

  var body = xml + speak + voice + '<break time="1000ms" /></speak>';
  return body;
}


module.exports = Docomo;


