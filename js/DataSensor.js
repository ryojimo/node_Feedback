/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
var fs = require( 'fs' );


/**
 * データ class
 * @param {void}
 * @constructor
 * @example
 * var obj = new DataSensor();
*/
var DataSensor = function(name){
  /**
   * センサ名
   * @type {string}
  */
  this.name = name;

  /**
   * 30 秒前までのセンサ値
   * @type {Object}
  */
  this.dataLast30s = { "30秒前": 0, "20秒前": 0, "10秒前": 0, "今": 0 };

  /**
   * 1 日のセンサ値
   * @type {Object}
  */
  this.date;
  this.dataOneDay = { "00-00": 0, "01-00": 0, "02-00": 0, "03-00": 0, "04-00": 0, "05-00": 0,
                      "06-00": 0, "07-00": 0, "08-00": 0, "09-00": 0, "10-00": 0, "11-00": 0,
                      "12-00": 0, "13-00": 0, "14-00": 0, "15-00": 0, "16-00": 0, "17-00": 0,
                      "18-00": 0, "19-00": 0, "20-00": 0, "21-00": 0, "22-00": 0, "23-00": 0};
};


/**
 * dataLast30s プロパティを更新する。
 * @param {number} data - 更新するデータ
 * @return {void}
 * @example
 * UpdateDataLast30s( data );
*/
DataSensor.prototype.UpdateDataLast30s = function( data ){
//  console.log( "[DataSensor.js] UpdateDataLast30s()" );
//  console.log( "[DataSensor.js] data = " + data );

  this.dataLast30s["30秒前"] = this.dataLast30s["20秒前"];
  this.dataLast30s["20秒前"] = this.dataLast30s["10秒前"];
  this.dataLast30s["10秒前"] = this.dataLast30s["今"];
  this.dataLast30s["今"    ] = data;
//  console.log('[DataSensor.js] this.dataLast30s = ' + JSON.stringify(this.dataLast30s) );
}


/**
 * 引数の file からデータを読み出して dataOneDay プロパティを更新する。
 * @param {string} file - 対象のファイル ( フルパス )
 * @return {object} ret - 読み出したデータ
 * @example
 * UpdateDataOneDay( file );
*/
DataSensor.prototype.UpdateDataOneDay = function( file ){
  console.log( "[DataSensor.js] UpdateDataOneDay()" );
  console.log( "[DataSensor.js] file = " + file );

  var date = file.replace( '/media/pi/USBDATA/', '' );
  date = date.replace( '_sensor.txt', '' );

  this.date = date;
  console.log( "[DataSensor.js] this.date = " + this.date );

  var ret = false;
  try{
    var ret = fs.readFileSync( file, 'utf8');
    var obj = (new Function("return " + ret))();

    for( var key in this.dataOneDay ){
      this.dataOneDay[key] = obj[key][this.name];
    }
//  console.log( '[DataSensor.js] this.dataOneDay = ' + JSON.stringify(this.dataOneDay) );
  } catch( err ){
    if( err.code === 'ENOENT' ){
      console.log( "[DataSensor.js] file does not exist." );
      for( var key in this.dataOneDay ){
        this.dataOneDay[key] = 0;
      }
      ret = false
    }
  }
  return ret;
};


/**
 * dataLast30s プロパティで "10秒前" と "今" の値に大きな差があるか？チェックする。
 * @param {void}
 * @return {bool} ret - 500 以上の差があれば true を返す
 * @example
 * IsLargeDiff();
*/
DataSensor.prototype.IsLargeDiff = function(){
//  console.log( "[DataSensor.js] IsLargeDiff()" );

//  console.log( "[DataSensor.js] 10秒前 = " + this.dataLast30s["10秒前"] );
//  console.log( "[DataSensor.js] 今     = " + this.dataLast30s["今"] );

  var diff = this.dataLast30s["10秒前"] - this.dataLast30s["今"];
  var ret = false;

  if( this.dataLast30s["10秒前"] != 0 && ( diff < -500 || 500 < diff ) ){
    ret = true;
    console.log( "10秒前の値と今の値が 500 以上差があります。" );
  } else {
    ret = false;
  }

  return ret;
}


module.exports = DataSensor;
