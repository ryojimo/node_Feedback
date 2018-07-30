/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
var fs = require( 'fs' );
var MongoClient  = require( 'mongodb' ).MongoClient;


/**
 * データ class
 * @param {void}
 * @constructor
 * @example
 * var obj = new DataSensors();
*/
var DataSensors = function(){
  /**
   * MongoDB のデータベース名
   * @type {string}
  */
  this.nameDatabase = 'sensors';

  /**
   * MongoDB の URL
   * @type {string}
  */
  this.mongo_url = 'mongodb://localhost:27017/';

  /**
   * 30 秒前までのセンサ値が入った JSON 配列
   * @type {Object}
  */
  this.data30s = [];
};


/**
 * data30s プロパティを初期化する。
 * @param {Array.<string>} names - センサ名の配列
 * @return {void}
 * @example
 * InitData30s( data );
*/
DataSensors.prototype.InitData30s = function( names ){
  console.log( "[DataSensors.js] InitData30s()" );

  for( var i = 0; i < names.length; i++ ){
    this.data30s[i] = {sensor: names[i], values: { '30秒前': 0, '20秒前': 0, '10秒前': 0, '今': 0 }};
  }

  console.log('[DataSensors.js] this.data30s = ' + JSON.stringify(this.data30s) );
}


/**
 * data30s プロパティを更新する。
 * @param {Object.<string, number>} jsonObj - {センサ名:値, ...} が入った JSON オブジェクト
 * @return {string} - 更新した this.data30s の JSON オブジェクト
 * @example
 * UpdateData30s( {"sa_acc_x":2030, "sa_acc_y":2847, "sa_acc_z" :1855, ....} );
*/
DataSensors.prototype.UpdateData30s = function( jsonObj ){
  console.log( "[DataSensors.js] UpdateData30s()" );
//  console.log( "[DataSensors.js] data = " + JSON.stringify(jsonObj) );

//  var jsonObj = (new Function( 'return ' + jsonObj ))();

  for( var key in jsonObj ){
    for( var i=0; i < this.data30s.length; i++ ){
      if( this.data30s[i].sensor == key ){
//        console.log('[DataSensors.js] key          = ' + key);
//        console.log('[DataSensors.js] jsonObj[key] = ' + jsonObj[key]);
        this.data30s[i].values['30秒前'] = this.data30s[i].values['20秒前'];
        this.data30s[i].values['20秒前'] = this.data30s[i].values['10秒前'];
        this.data30s[i].values['10秒前'] = this.data30s[i].values['今'];
        this.data30s[i].values['今'] = jsonObj[key];
      }
    }
  }

//  console.log('[DataSensors.js] this.data30s = ' + JSON.stringify(this.data30s) );
    return( this.data30s );
}


/**
 * this.data30s プロパティで "10秒前" と "今" の値に大きな差があるか？チェックする。
 * @param {string} name - センサ名
 * @return {bool} ret - 500 以上の差があれば true を返す
 * @example
 * IsLargeDiff();
*/
DataSensors.prototype.IsLargeDiff = function( name ){
  console.log( "[DataSensor.js] IsLargeDiff()" );
  console.log( "[DataSensor.js] name = " + name );

  var diff = 0;
  var flg = 0;
  for( var i=0; i < this.data30s.length; i++ ){
    if( this.data30s[i].sensor == name ){
//    console.log('[DataSensors.js] key          = ' + key);
//    console.log('[DataSensors.js] jsonObj[key] = ' + jsonObj[key]);
      flg  = this.data30s[i].values['10秒前'];
      diff = this.data30s[i].values['10秒前'] - this.data30s[i].values['今'];
    }
  }

  var ret = false;
  if( flg != 0 && ( diff < -500 || 500 < diff ) ){
    ret = true;
    console.log( "10秒前の値と今の値が 500 以上差があります。" );
  } else {
    ret = false;
  }

  return ret;
}


/**
 * Mongodb にデータベース、コレクション、ドキュメントを作成する。
 * @param {string} day - 日付。( MongoDB のコレクション名でも使用 )
 * @param {string} hour - 時間。
 * @param {Object.<string, number>} jsonObj - {センサ名:値, ...} が入った JSON オブジェクト
 * @return {void}
 * @example
 * CreateMDDoc( "2018-05-14", "08:00", "{...}" );
*/
DataSensors.prototype.CreateMDDoc = function( day, hour, jsonObj ){
  console.log( "[DataSensors.js] CreateMDDoc()" );

  var doc = { hour: hour, sensors: jsonObj };

  MongoClient.connect( this.mongo_url, function(err, db) {
    if( err ){
      throw err;
    }

    // データベースを取得する
    var dbo = db.db( 'sensors' );

    // コレクションを取得する
    var clo = dbo.collection( day );

    // doc をデータベースに insert する
    clo.insertOne( doc, function(err, res) {
      if( err ){
        throw err;
      }
      db.close();
    });
  });
}


/**
 * 指定した日付の指定したセンサの 1 日の値を取得する。
 * @param {string} day - 対象の日付。( MongoDB のコレクション名でも使用 )
 * @param {string} sensor - 対象のセンサ。
 * @param {function(boolean, Object.<string, number>)} callback - データを取得するためのコールバック関数
 * @return {void}
 * @example
 * GetMDDocDataOneDay( '2018-05-14', 'si_bme280_temp' );
*/
DataSensors.prototype.GetMDDocDataOneDay = function( day, sensor, callback ){
  console.log( "[DataSensors.js] GetMDDocDataOneDay()" );
  console.log( "[DataSensors.js] day    = " + day );
  console.log( "[DataSensors.js] sensor = " + sensor );

  var cname = day;  // コレクション名

  var data = { '00-00': 0, '01-00': 0, '02-00': 0, '03-00': 0, '04-00': 0, '05-00': 0,
               '06-00': 0, '07-00': 0, '08-00': 0, '09-00': 0, '10-00': 0, '11-00': 0,
               '12-00': 0, '13-00': 0, '14-00': 0, '15-00': 0, '16-00': 0, '17-00': 0,
               '18-00': 0, '19-00': 0, '20-00': 0, '21-00': 0, '22-00': 0, '23-00': 0
             };

  MongoClient.connect( this.mongo_url, function(err, db) {
    if( err ) throw err;

    // データベースを取得する
    var dbo = db.db( 'sensors' );

    // コレクションを取得する
    var clo = dbo.collection( cname );

    // コレクションに含まれるすべてのドキュメントを取得する
    clo.find({}).toArray( function(err, documents){
      try{
        if( err ){
          throw err;
        }

        var i = 0;
        for( var key in data ){
          data[key] = documents[i].sensors[sensor];
          i++;
        }
        db.close();

//      console.log( data );
        callback( true, data );
      }
      catch( e ){
        console.log( "[DataSensors.js] e = " + e );
        callback( false, data );
      }
    });
  });
}


module.exports = DataSensors;


