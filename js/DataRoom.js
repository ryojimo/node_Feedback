/**
 * @fileoverview データクラスを定義したファイル
 * @author       Ryoji Morita
 * @version      0.0.1
*/

'use strict';

// 必要なライブラリをロード
var fs = require( 'fs' );
require( 'date-utils' );


/**
 * データ class
 * @param {void}
 * @constructor
 * @example
 * var obj = new DataRoom();
*/
var DataRoom = function(){
  /**
   * this.hur から this.hour+1 の間の入場者数 (= this.cnt )
   * @type {Object}
  */
  this.hour = 0;
  this.cnt = 0;

  /**
   * 1 日の入場者数
   * @type {Object}
  */
  this.date = 0;
  this.dataOneDay = { '00-00': 0, '01-00': 0, '02-00': 0, '03-00': 0, '04-00': 0, '05-00': 0,
                      '06-00': 0, '07-00': 0, '08-00': 0, '09-00': 0, '10-00': 0, '11-00': 0,
                      '12-00': 0, '13-00': 0, '14-00': 0, '15-00': 0, '16-00': 0, '17-00': 0,
                      '18-00': 0, '19-00': 0, '20-00': 0, '21-00': 0, '22-00': 0, '23-00': 0};
};


/**
 * データを更新する
 * @param {void}
 * @return {void}
 * @example
 * Update( data );
*/
DataRoom.prototype.Update = function(){
  console.log( "[DataRoom.js] Update()" );
  this.cnt++;
  console.log( "[DataRoom.js] cnt = " + this.cnt );
}


/**
 * 引数の file からデータを読み出して dataOneDay プロパティを更新する。
 * @param {string} file - 対象のファイル ( フルパス )
 * @return {Object} ret - 読み出したデータ
 * @example
 * var obj = UpdateDataOneDay( '/media/pi/USBDATA/2018-01-23_room.txt' );
*/
DataRoom.prototype.UpdateDataOneDay = function( file ){
  console.log( "[DataRoom.js] UpdateDataOneDay()" );
  console.log( "[DataRoom.js] file = " + file );

  var date = file.replace( '/media/pi/USBDATA/', '' );
  date = date.replace( '_room.txt', '' );

  this.date = date;
  console.log( "[DataRoom.js] this.date = " + this.date );

  var ret = false;
  try{
    fs.statSync( file );
    var ret = fs.readFileSync( file, 'utf8');
    var obj = (new Function("return " + ret))();

    for( var key in this.dataOneDay ){
      this.dataOneDay[key] = obj[key];
    }
    console.log( '[DataRoom.js] this.dataOneDay = ' + JSON.stringify(this.dataOneDay) );
  } catch( err ){
    if( err.code === 'ENOENT' ){
      console.log( "[DataRoom.js] file does not exist." );
      for( var key in this.dataOneDay ){
        this.dataOneDay[key] = 0;
      }
      ret = false
    }
  }
  return ret;
};


/**
 * 引数の file の中身を更新する
 * @param {string} file - 対象のファイル ( フルパス )
 * @return {void}
 * @example
 * AppendFile( "/media/pi/USBDATA/2018-01-23_room.txt" );
*/
DataRoom.prototype.AppendFile = function( file ){
  console.log( "[DataRoom.js] AppendFile()" );
  console.log( "[DataRoom.js] file = " + file );


  var date = new Date();
  var hour = toDoubleDigits( date.getHours() );
  var str = '';

  if( hour == '00' ){
    str += '{';
  }

  // hour から -1 した時間を this.hour にセット
  this.hour = toDoubleDigits(hour - 1) + '-00';
  str += '"' + this.hour + '"' + ':' + this.cnt;

  if( hour == '23' ){
    str += '}';
  } else {
    str += ', ';
  }

  console.log( "[DataRoom.js] hour = " + hour );
  console.log( "[DataRoom.js] this.hour = " + this.hour );
  console.log( "[DataRoom.js] str = " + str );

  try{
    fs.appendFileSync( file, str, 'utf8' );
  } catch( err ){
    if( err.code === 'ENOENT' ){
      console.log( "[DataPerson.js] file does not exist." );
    }
  }

  this.cnt = 0;
}


/**
 * 数字が 1 桁の場合に 0 埋めで 2 桁にする
 * @param {number} num - 数値
 * @return {number} num - 0 埋めされた 2 桁の数値
 * @example
 * toDoubleDigits( 8 );
*/
var toDoubleDigits = function( num ){
  console.log( "[DataRoom.js] toDoubleDigits()" );
  console.log( "[DataRoom.js] num = " + num );
  num += '';
  if( num.length === 1 ){
    num = '0' + num;
  }
  return num;
};


module.exports = DataRoom;


