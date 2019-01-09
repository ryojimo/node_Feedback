/**
 * @fileoverview API クラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
require('date-utils');


/**
 * API class
 * @param {void}
 * @constructor
 * @example
 * let obj = new ApiCmn();
*/
class ApiCmn {
  /**
   * 現在の日付を YYYY-MM-DD 形式で取得する
   * @param {number} offset - 現在の日付に加える offset 日数。引数に何も指定しなければ、本関数は現在の日付を返す。
   * @return {string} ret - 日付
   * @example
   * yyyymmdd();
  */
  yyyymmdd( offset = 0 ){
    console.log("[ApiCmn.js] yyyymmdd()");
    console.log("[ApiCmn.js] offset = " + offset);

    let date = new Date();

    date.setDate(date.getDate() + offset);

    let yyyy = date.getFullYear();
    let mm   = ('0' + (date.getMonth() + 1)).slice(-2);
    let dd   = ('0' +  date.getDate()      ).slice(-2);

    let ret = yyyy + '-' + mm + '-' + dd;
    console.log("[ApiCmn.js] ret = " + ret);
    return ret;
  };


  /**
   * 現在の時刻を HH:MM:SS 形式で取得する
   * @param {void}
   * @return {string} ret - 時刻
   * @example
   * hhmmss();
  */
  hhmmss(){
    console.log("[main.js] hhmmss()");
    let date = new Date();

    let hour = ('0' + date.getHours()   ).slice(-2);  // 現在の時間を 2 桁表記で取得
    let min  = ('0' + date.getMinutes() ).slice(-2);  // 現在の  分を 2 桁表記で取得
    let sec  = ('0' + date.getSeconds() ).slice(-2);  // 現在の  秒を 2 桁表記で取得

    let ret = hour + ':' + min + ':' + sec;
    console.log("[main.js] ret = " + ret);
    return ret;
  };


};


module.exports = ApiCmn;


