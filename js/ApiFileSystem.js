/**
 * @fileoverview API クラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
let fs = require('fs');


/**
 * API class
 * @param {void}
 * @constructor
 * @example
 * let obj = new ApiFileSystem();
*/
class ApiFileSystem {
  /**
   * 引数の file からデータを読み出して JSON オブジェクトにして返す。
   * @note ファイルの中に書かれている文字が JSON 形式である必要があります。
   * @param {string} file - 対象のファイル ( フルパス )
   * @return {object} ret - file から読み出した JSON 形式のデータ
   * @example
   * let obj = read('/media/pi/USBDATA/sensor/2018-01-23_sensor.txt');
  */
  read(file) {
    console.log("[ApiFileSystem.js] read()");
    console.log("[ApiFileSystem.js] file = " + file);

    let ret = null;
    let jsonObj = null;

    try {
      fs.statSync(file);
      ret = fs.readFileSync(file, 'utf8');
      jsonObj = (new Function("return " + ret))();
  //    console.log("[ApiFileSystem.js] jsonObj = " + JSON.stringify(jsonObj));
      ret = jsonObj;
    } catch(err) {
      if(err.code === 'ENOENT') {
        console.log("[ApiFileSystem.js] file does not exist.");
        ret = null;
      }
    }
    return ret;
  };


  /**
   * 引数の file の中身に jsonObj を付け加える。
   * @note ファイルの中に書かれている文字が JSON 形式である必要があります。
   * @param {string} file - 対象のファイル ( フルパス )
   * @param {object} jsonObj - 付け加える json 形式のデータ
   * @return {void}
   * @example
   * append("/media/pi/USBDATA/sensor/2018-01-23_sensor.txt", {});
  */
  append(file, jsonObj) {
    console.log("[ApiFileSystem.js] append()");
    console.log("[ApiFileSystem.js] file = " + file);
    console.log("[ApiFileSystem.js] jsonObj = " + JSON.stringify(jsonObj));

    let str = JSON.stringify(jsonObj);

    try {
      fs.statSync(file);
      fs.appendFileSync(file, str, 'utf8');
    } catch(err) {
      if(err.code === 'ENOENT') {
        console.log("[ApiFileSystem.js] file does not exist.");
        try {
          this.write(file, str);
        } catch(err) {
          console.log("[ApiFileSystem.js] error happens.");
        }
      }
    }

    this.cnt = 0;
  }


  /**
   * 引数の file の中身に jsonObj を書き込む。
   * @param {string} file - 対象のファイル ( フルパス )
   * @param {object} jsonObj - 書き込む json 形式のデータ
   * @return {void}
   * @example
   * write("/media/pi/USBDATA/sensor/2018-01-23_sensor.txt", {});
  */
  write(file, jsonObj) {
    console.log("[ApiFileSystem.js] write()");
    console.log("[ApiFileSystem.js] file = " + file);
    console.log("[ApiFileSystem.js] jsonObj = " + JSON.stringify(jsonObj));

    let str = JSON.stringify(jsonObj);

    try {
      fs.writeFileSync(file, str, 'utf8');
    } catch(err) {
      if(err.code === 'ENOENT') {
        console.log("[ApiFileSystem.js] file does not exist.");
      }
    }

    this.cnt = 0;
  }


  /**
   * 引数の file を削除する。
   * @param {string} file - 対象のファイル ( フルパス )
   * @return {void}
   * @example
   * delete("/media/pi/USBDATA/sensor/2018-01-23_sensor.txt");
  */
  delete(file) {
    console.log("[ApiFileSystem.js] delete()");
    console.log("[ApiFileSystem.js] file = " + file);

    try {
      fs.unlinkSync(file);
    } catch(err) {
      console.log("[ApiFileSystem.js] error happens.");
    }

    this.cnt = 0;
  }


};


module.exports = ApiFileSystem;


