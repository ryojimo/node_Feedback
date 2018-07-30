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
 * var obj = new PlayMusic();
*/
var PlayMusic = function(){
  /**
   * データ
   * @type {Object}
  */
  this.status = 'STOP';
  this.filename;
  this.child = null;
};


/**
 * 引数の filename を再生する
 * @param {string} filename - 再生するファイル
 * @return {void}
 * @example
 * Play( "Pink\ -\ Blow\ Me.mp3" );
*/
PlayMusic.prototype.Play = function( filename ){
  console.log( "[PlayMusic.js] PLAY()" );
  console.log( "[PlayMusic.js] filename = " + filename );

  if( this.status == 'STOP' ){
    this.status = 'PLAY';
    this.filename = filename;
    var cmd = 'play';
    var args = ['-v', '0.4', '../MyContents/' + this.filename];

    var spawn = require( 'child_process' ).spawn;
    this.child = spawn( cmd, args );

    this.child.on( 'exit', function(){
      console.log( "[PlayMusic.js] " + "PLAYING" + ": (      ) exit" );
//    process.exit(0);
    });

    this.child.stdout.setEncoding( 'utf-8' );
    this.child.stdout.on( 'data', function( data ){
      console.log( "[PlayMusic.js] " + "PLAYING" + ": (stdout) " + data );
    });

    this.child.stderr.setEncoding( 'utf-8' );
    this.child.stderr.on( 'data', function( data ){
      console.log( "[PlayMusic.js] " + "PLAYING" + ": (stderr) " + data );
    });
  } else{
    console.log( "[PlayMusic.js] this.status is not 'STOP'." );
    console.log( "[PlayMusic.js] this.status = " + this.status );
  }
}


/**
 * 状態を STOP/PAUSE/RESTART に変更してシグナルを this.child へ送る
 * @param {string} status - 'STOP' or 'PAUSE' or 'RESTART'
 * @return {void}
 * @example
 * Stop();
*/
PlayMusic.prototype.ChangeStatus = function( status ){
  console.log( "[PlayMusic.js] ChangeStatus()" );
  console.log( "[PlayMusic.js] status = " + status );
  this.status = status;

  var signal = 'SIGKILL';
  switch( status ){
  case 'STOP'   : signal = 'SIGKILL'; break;   // this.child プロセスを終了する
  case 'PAUSE'  : signal = 'SIGSTOP'; break;   // this.child プロセスを一時停止する
  case 'RESUME' : signal = 'SIGCONT'; break;   // this.child プロセスを再開する
  }

  if( this.child != null ){
    this.child.kill( signal );
  }
}


/**
 * play プロセスのプロセス ID を取得する
 * @param {function(string)} callback - GID を渡すための callback 関数
 * @return {void}
 * @example
 * Stop();
*/
PlayMusic.prototype.GetPID = function( callback ){
  console.log( "[PlayMusic.js] GetPID()" );

  var cmd  = 'ps  aux  |  grep  play\\ -v';

  var exec = require( 'child_process' ).exec;
  var ret  = exec( cmd,
    function( err, stdout, stderr ){
//      console.log( "[PlayMusic.js] stdout = " + stdout );
//      console.log( "[PlayMusic.js] stderr = " + stderr );
      if( err ){
        console.log( "[PlayMusic.js] " + err );
      }

      var array = stdout.split( /\s+/ );
//      console.log( "[PlayMusic.js] array[0] = \n" + array[0] );
//      console.log( "[PlayMusic.js] array[1] = \n" + array[1] );

      if( callback != undefined ){
        callback( array[1] );
      }
    });
}


module.exports = PlayMusic;


