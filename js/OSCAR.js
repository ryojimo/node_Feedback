//
// OSCAR
//

'use strict';

const eventEmitter = require('events').EventEmitter;
const net = require('net');

class OSCAR extends eventEmitter {

  constructor(host, port) {
    super();
    this._connectState = 0;
    this._client = null;
    this._host = host;
    this._port = port;
    this._intervalId = null;
    this._IntervalConnect();
  }
  
  _IntervalConnect() {
    if(this._connectState == 0) {
      this._client = net.connect(this._port, this._host);

      this._client.on('connect', () => {
        this._connectState = 1;
        console.log('[OSCAR.js] connect controller : ', this._host);
      });

      this._client.on('data', (data) => {
        console.log('[OSCAR.js] thi.host : ', this._host );
        console.log('[OSCAR.js] data     : ', data );
        console.log('[OSCAR.js] data(len): ', data.length );
        if(data.length == 14) {
          if(this._connectState == 1) {
            let gid = '';
            for(let j = 0; j < 10; j++) {
              gid += String.fromCharCode(data[j + ((j < 5)?5:-5)] - 0x81);
            }
            console.log('[OSCAR.js] gid : ', gid);
            this.emit('oscarGID', gid);
          }
        }
      });

      this._client.on('end', () => {
        console.log('[OSCAR.js] disconnect controller : ', this._host);
        this._connectState = 0;
      });

      this._client.on('error', (e) => {
        this._connectState = 0;
        this._client.destroy();
        console.log('[OSCAR.js] ----');
        console.log('[OSCAR.js] [ error ]');
        console.log(Date());
        console.log(e.stack);
        console.log('[OSCAR.js] ----');
      });
    }
    if(this._intervalId == null) {
      this._intervalId = setInterval(() => { this._IntervalConnect(); }, 5 * 1000);
    }
  }  
}

module.exports = OSCAR;
