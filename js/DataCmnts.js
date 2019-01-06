/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
let fs = require('fs');
let MongoClient  = require('mongodb').MongoClient;


/**
 * データ class
 * @param {void}
 * @constructor
 * @example
 * let obj = new DataCmnt();
*/
let DataCmnts = function() {
  /**
   * MongoDB のデータベース名
   * @type {string}
  */
  this.nameDatabase = 'comments';

  /**
   * MongoDB の URL
   * @type {string}
  */
  this.mongo_url = 'mongodb://localhost:27017/';
};


/**
 * Mongodb にデータベース、コレクション、ドキュメントを作成する。
 * @param {Object.<string, string>} data - JSON 文字列
 * @return {void}
 * @example
 * CreateMDDoc("{...}");
*/
DataCmnts.prototype.CreateMDDoc = function(data) {
  console.log("[DataCmnts.js] CreateMDDoc()");
  console.log("[DataCmnts.js] data = " + data);

//  let jsonObj = (new Function('return ' + data))();

  let doc = {date: data.date, time: data.time, area: data.area, gid: data.gid, cmnt: data.cmnt};

  MongoClient.connect(this.mongo_url, function(err, db) {
    if(err) {
      throw err;
    }

    // データベースを取得する
    let dbo = db.db('comments');

    // コレクションを取得する
    let clo = dbo.collection('feedback');

    // doc をデータベースに insert する
    clo.insertOne(doc, function(err, res) {
      if(err) {
        throw err;
      }
      db.close();
    });
  });
}


/**
 * 指定した日付のコメントを取得する。
 * @param {string} date - 対象の日付。
 * @param {function(boolean, Object.<string, number>)} callback - データを取得するためのコールバック関数
 * @return {void}
 * @example
 * GetMDDocDataOneDay('2018-07-25', ...);
*/
DataCmnts.prototype.GetMDDocDataOneDay = function(date, callback) {
  console.log("[DataCmnts.js] GetMDDocDataOneDay()");
  console.log("[DataCmnts.js] date   = " + date);

  MongoClient.connect(this.mongo_url, function(err, db) {
    if(err) throw err;

    // データベースを取得する
    let dbo = db.db('comments');

    // コレクションを取得する
    let clo = dbo.collection('feedback');

    let query = {date: date};

    // {date: date} のドキュメントを取得する
    clo.find(query).toArray(function(err, documents) {
      try{
        if(err) {
          throw err;
        }

        db.close();

//      console.log(documents);
        callback(true, documents);
      }
      catch(e) {
        console.log("[DataCmnts.js] e = " + e);
        callback(false, documents);
      }
    });
  });
}


module.exports = DataCmnts;


