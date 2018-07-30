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
 * var obj = new DataPerson();
*/
var DataPerson = function(){
  /**
   * データ
   * @type {Object}
  */
  this.data = { gid:'', name:'', cnt:0, lastVisitDay:'' };
};


/**
 * データを更新する
 * @param {Object} data - 更新するデータ
 * @return {void}
 * @example
 * Update( obj );
*/
DataPerson.prototype.Update = function( data ){
  console.log( "[DataPerson.js] Update()" );

  this.data.gid          = data.gid;
  this.data.name         = data.name;
  this.data.cnt++;
  this.data.lastVisitDay = data.lastVisitDay;
}


/**
 * 引数の file の中身を更新する
 * @param {string} file - 対象のファイル ( フルパス )
 * @return {void}
 * @example
 * UpdateFile( '/media/pi/USBDATA/person.txt' );
*/
DataPerson.prototype.UpdateFile = function( file ){
  console.log( "[DataPerson.js] UpdateFile()" );
  console.log( "[DataPerson.js] file = " + file );

  var obj = new Array();
  var cnt = -1;

  var ret = this.ReadFile( file );
  if( ret !== false ){
    // JSON 配列の形式に整形
    obj = this.MakeJson( ret );

    for( cnt = 0; cnt < obj.length; cnt++ ){
      if( obj[cnt].gid === this.data.gid ){
          obj[cnt].cnt++;
          obj[cnt].lastVisitDay = this.data.lastVisitDay;
          break;
      }
    }
  }

  if( cnt === -1 || cnt === obj.length ){
    obj.push( this.data );
  }

  // ファイルに書き込む
  var wdata = JSON.stringify( obj );
  wdata = wdata.substr( 1, wdata.length - 2 ) + ',';
  wdata = wdata.replace( /},/g, '},\n' );

  var ret = false;
  try{
    ret = fs.writeFileSync( file, wdata, 'utf8' );
  } catch( err ){
    if( err.code === 'ENOENT' ){
      console.log( "[DataPerson.js] file does not exist." );
    }
  }
}


/**
 * 引数の file から gid のデータを取得する
 * @param {string} file - 対象のファイル ( フルパス )
 * @param {number} gid - Global ID
 * @return {Object} data - 読み出したデータ
 * @example
 * GetData( '/media/pi/USBDATA/person.txt', '0000******' );
*/
DataPerson.prototype.GetData = function( file, gid ){
  console.log( "[DataPerson.js] GetData()" );
  console.log( "[DataPerson.js] file = " + file );
  console.log( "[DataPerson.js] gid = " + gid );

  var obj = new Array();
  var cnt = -1;
  var data = { gid:'', name:'', cnt:1, lastVisitDay:'' };

  var ret = this.ReadFile( file );
  if( ret !== false ){
    // JSON 配列の形式に整形
    obj = this.MakeJson( ret );

    for( cnt = 0; cnt < obj.length; cnt++ ){
      if( obj[cnt].gid === gid ){
          data.gid = obj[cnt].gid;
          data.name = obj[cnt].name;
          data.cnt = obj[cnt].cnt;
          data.lastVisitDay = obj[cnt].lastVisitDay;
          break;
      }
    }
  }

  if( cnt === -1 || cnt === obj.length ){
    data.gid = gid;
    data.name = 'Guest';
    data.cnt = 0;
    data.lastVisitDay = '';
  }
  return data;
}


/**
 * 引数の file からデータを読み出して訪問回数が多い Top 50 を取得する
 * @param {string} file - 対象のファイル ( フルパス )
 * @return {Object} data - 読み出したデータ
 * @example
 * GetRanking( '/media/pi/USBDATA/person.txt' );
*/
DataPerson.prototype.GetRanking = function( file ){
  console.log( "[DataPerson.js] GetRanking()" );
  console.log( "[DataPerson.js] file = " + file );

  var obj = new Array();
  var cnt = -1;

  var ret = this.ReadFile( file );
  if( ret !== false ){
    // JSON 配列の形式に整形
    obj = this.MakeJson( ret );

    obj.sort( function( val1, val2 ){
      var val1 = val1.cnt;
      var val2 = val2.cnt;
      if( val1 < val2 ){
        return 1;
      } else {
        return -1;
      }
    });
  }

  var rank = new Array();
  var i = 0;
  for( i=0; i < 20; i++ ){
//    console.log( "[DataPerson.js] name = " + obj[i].name );
//    console.log( "[DataPerson.js] cnt  = " + obj[i].cnt  );
    rank.push( {name:obj[i].name, cnt:obj[i].cnt} );
  }

//  console.log( "[DataPerson.js] obj = " + JSON.stringify(rank) );
  return rank;
}


/**
 * 引数の file の中身を読み出す
 * @param {string} file - 対象のファイル ( フルパス )
 * @return {Object} ret - 読み出したデータ
 * @example
 * var obj = ReadFile( "/media/pi/USBDATA/data.txt" );
*/
DataPerson.prototype.ReadFile = function( file ){
  console.log( "[DataPerson.js] ReadFile()" );
  console.log( "[DataPerson.js] file = " + file );

  var ret = false;
  try{
    fs.statSync( file );
    ret = fs.readFileSync( file, 'utf8' );
  } catch( err ){
    if( err.code === 'ENOENT' ){
      console.log( "[DataPerson.js] file does not exist." );
      ret = false;
    }
  }
  return ret;
}


/**
 * 文字列を JSON 形式に整形する
 * @param {string} string - 文字列
 * @return {Object} obj - JSON 形式のデータ
 * @example
 * var obj = MakeJson( str );
*/
DataPerson.prototype.MakeJson = function( string ){
  console.log( "[DataPerson.js] MakeJson()" );
//  console.log( "[DataPerson.js] file = " + string );

  var obj = new Array();
  var ret;

  ret = string.substr( 0, string.length - 2 );
  ret = '[ ' + ret + ' ]';
  obj = (new Function('return ' + ret))();
  return obj;
}


module.exports = DataPerson;


