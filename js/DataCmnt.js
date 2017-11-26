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
 * var obj = new DataCmnt();
*/
var DataCmnt = function(){
  /**
   * データ
   * @type {Object}
  */
  this.data = { time:"", area:"", gid:"", cmnt:"" };
};


/**
 * データを更新する
 * @param {object} data - 更新するデータ
 * @return {void}
 * @example
 * Update( obj );
*/
DataCmnt.prototype.Update = function( data ){
  console.log( "[DataCmnt.js] Update()" );

  this.data.time = data.time;
  this.data.area = data.area;
  this.data.gid  = data.gid;
  this.data.cmnt = data.cmnt;
}


/**
 * 引数の file にデータを追記する
 * @param {string} file - 対象のファイル ( フルパス )
 * @return {void}
 * @example
 * AppendFile( "./data/data.txt" );
*/
DataCmnt.prototype.AppendFile = function( file ){
  console.log( "[DataCmnt.js] AppendFile()" );
  console.log( "[DataCmnt.js] file = " + file );

  var wdata = JSON.stringify(this.data) + ", \n";
  console.log( "[dataCmnt.js] wdata = " + wdata );

  try{
    fs.appendFileSync( file, wdata, 'utf8' );
  } catch( err ){
    if( err.code === 'ENOENT' ){
      console.log( "[dataCmnt.js] file does not exist." );
    }
  }
}


/**
 * 引数の file の中身を読み出す
 * @param {string} file - 対象のファイル ( フルパス )
 * @return {object} ret - 読み出したデータ
 * @example
 * var obj = ReadFile( "./data/data.txt" );
*/
DataCmnt.prototype.ReadFile = function( file ){
  console.log( "[DataCmnt.js] ReadFile()" );
  console.log( "[DataCmnt.js] file = " + file );

  var ret = false;
  try{
    fs.statSync( file );
    ret = fs.readFileSync( file, 'utf8' );
  } catch( err ){
    if( err.code === 'ENOENT' ){
      console.log( "[dataCmnt.js] file does not exist." );
      ret = false;
    }
  }
  return ret;
}


module.exports = DataCmnt;
