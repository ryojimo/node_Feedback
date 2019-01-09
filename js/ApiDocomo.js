/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
let fs      = require('fs');
let request = require('request');


/**
 * API class
 * @param {void}
 * @constructor
 * @example
 * let obj = new ApiDocomo();
*/
class ApiDocomo {

  constructor() {
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
  }


  /**
   * this.voice と this.voice_filename を更新する
   * @param {string} speaker - アップデートする voice
   * @param {string} filename - ****.lpcm, ****.wav 中間ファイルのファイル名 (= **** の部分 )
   * @return {void}
   * @example
   * update("nozomi", "hello");
  */
  update(speaker, filename) {
    console.log("[Docomo.js] update()");
    console.log("[Docomo.js] filename = " + filename);

    this.voice = speaker;
    this.voice_filename = filename;
  }


  /**
   * 話す声をランダムで選択して返す
   * @param {void}
   * @return {string} person- 話す声
   * @example
   * getVoice();
  */
  getVoice() {
    console.log("[Docomo.js] getVoice()");

    let person = ['nozomi', 'maki', 'reina', 'taichi',
                  'sumire', 'kaho', 'akari', 'nanako',
                  'seiji', 'osamu', 'hiroshi', 'anzu', 'tihiro', 'koutaro', 'yuto'
                 ];

    let no = Math.floor(Math.random() * person.length);
    return person[no];
  }


  /**
   * XML 形式の HTTP Body を作る。
   * @param {string} speaker - 話者名．この中から選べる ( http://www.ai-j.jp/ )
   * @param {string} cmnt - せりふ
   * @return {string} body - HTTP Body
   * @example
   * makeDocomoXML("nozomi", "こんにちは");
  */
  makeDocomoXML(speaker, cmnt) {
    console.log( "[Docomo.js] makeDocomoXML()" );
    console.log( "[Docomo.js] speaker = " + speaker );
    console.log( "[Docomo.js] cmnt = " + cmnt );

    let xml = '<?xml version="1.0" encoding="utf-8" ?>';
    let speak = '<speak version="1.1">';
    let voice = '<voice name="' + speaker + '">' + cmnt + '</voice>';

    let body = xml + speak + voice + '<break time="1000ms" /></speak>';
    return body;
  }


  /**
   * wav データを request POST して play する
   * @param {string} httpData - POST する HTTP データ
   * @param {function} callback - play  ****.wav した後に呼び出すコールバック関数
   * @return {void}
   * @example
   * requestAndPlay(options, function);
  */
  requestAndPlay(httpData, callback) {
    let res = request.post(httpData);

    res.on('response', function(response) {
      console.log("[Docomo.js] response.statusCode = " + response.statusCode);
      console.log("[Docomo.js] headers = " + response.headers['content-type']);
    });

    let file_lpcm = this.voice_filename + '.lpcm';
    let file_wav  = this.voice_filename + '.wav';

    res.on('end', function( response) {
      let exec = require('child_process').exec;
      let ret = 0;

      let cmd_pcm2wav  = 'sox  -t  raw  -r  16k  -e  signed  -b  16  -B  -c  1  /media/pi/USBDATA/' + file_lpcm + '  /media/pi/USBDATA/' + file_wav;
      ret  = exec(cmd_pcm2wav, function(err, stdout, stderr) {
        if(err) {
          console.log("[Docomo.js] cmd_pcm2wav: " + err);
        }
      });

      let cmd_playwav  = 'play  /media/pi/USBDATA/' + file_wav;
      ret  = exec(cmd_playwav, function(err, stdout, stderr) {
        if(err) {
          console.log("[Docomo.js] cmd_playwav: " + err);
        }

        if(callback != undefined) {
          callback();
        }
      });
    }).pipe(fs.createWriteStream('/media/pi/USBDATA/' + file_lpcm));
  }


  /**
   * cmnt の文字列を話す
   * @param {string} cmnt - 話す文字列
   * @param {function} callback - play  ****.wav した後に呼び出すコールバック関数
   * @return {void}
   * @example
   * talk("こんにちは", function);
  */
  talk(cmnt, callback) {
    console.log("[Docomo.js] talk()");
    console.log("[Docomo.js] cmnt     = " + cmnt);
  //  console.log( "[Docomo.js] callback = " + callback );

    let apiBODY = this.makeDocomoXML(this.voice, cmnt);

    let docomoOptions = {
      uri: this.base_url + this.api_key,

//      proxy: 'http://proxy.sngw.sony.co.jp:10080',    // proxy 環境の時のみ記述

      headers: {
        'Content-Type': 'application/ssml+xml',
        'Accept': 'audio/L16'
      },
      form: apiBODY,
      json: true
    };

    //リクエスト送信
    console.log("[Docomo.js] docomoOptions = " + JSON.stringify(docomoOptions));
    this.requestAndPlay(docomoOptions, callback);
  }


};


module.exports = ApiDocomo;


