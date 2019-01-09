/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
require('date-utils');

const ApiCmn = require('./ApiCmn');
let g_apiCmn = new ApiCmn();


/**
 * データ class
 * @param {void}
 * @constructor
 * @example
 * let obj = new DataFeedback();
*/
class DataFeedback {

  constructor(jsonObj) {
    this.data = {
      gid: "",            // @type {string} : コメント記載者の Global ID
      email: "",          // @type {string} : コメント記載者の email アドレス
      date: "",           // @type {string} : コメントが記載された日にち
      time: "",           // @type {string} : コメントが記載された時間
      area: "",           // @type {string} : コメント対象のエリア
      comment: "",        // @type {string} : コメント内容
    };

    this.data = jsonObj;
  }


  /**
   * this.data を取得する。
   * @param {void}
   * @return {object} - this.data
   * @example
   * get();
  */
  get() {
    return this.data;
  }


  /**
   * this.data に値をセットする。
   * @param {object} - セットする json 形式のデータ
   * @return {void}
   * @example
   * set();
  */
  set(jsonObj) {
    this.data = jsonObj;
  }


  /**
   * Feedback を書き込む。
   * @param {string} gid - global ID
   * @param {string} email - email address
   * @param {string} area - コメント対象のエリア
   * @param {string} cmnt - コメント内容
   * @return {void}
   * @example
   * writeFeedback('0000114347', ****@gmail.com, 1, "コメント");
  */
  writeFeedback(gid, email, area, cmnt) {
    console.log("[DataFeedback.js] rentBook()");
    console.log("[DataFeedback.js] gid = " + gid);
    console.log("[DataFeedback.js] email = " + email);
    console.log("[DataFeedback.js] area = " + area);
    console.log("[DataFeedback.js] cmnt = " + cmnt);

    this.data.gid = gid;
    this.data.email = email;
    this.data.date = g_apiCmn.yyyymmdd();
    this.data.time = g_apiCmn.hhmmss();
    this.data.area = area;
    this.data.comment = cmnt;
  }


  /**
   * Feedback をクリアする。
   * @param {void}
   * @return {void}
   * @example
   * clearFeedback();
  */
  clearFeedback() {
    console.log("[DataFeedback.js] clearFeedback()");

    this.data.gid = "";
    this.data.email = "";
    this.data.date = "";
    this.data.time = "";
    this.data.area = "";
    this.data.comment = "";
  }


};


module.exports = DataFeedback;


