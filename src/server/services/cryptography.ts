const md5 = require('md5');
import { Buffer } from 'buffer';
import {
  createReadStream,
  createWriteStream,
  mkdtempSync,
  existsSync
} from 'fs';
import { Readable, Stream } from 'stream';
import {
  createDecipher,
  createCipher,
  randomBytes
} from 'crypto';
import { createGunzip, createGzip } from 'zlib';
import { Observable } from 'rxjs/observable';
import { Settings } from '../config/settings';
import { Utils } from '../util';

export class CryptographyService {
  key: string = '';
  constructor(
    key: string = null
    ) {
      this.key = (key && key.length !== 0) ?
      key :
      Settings.enc.key;
    }

  Encrypt(originalFile: string): Observable<any> {
    return new Observable(observer => {
      let zip = createGzip();
      let unsafeKey = this.GetKey();
      let cipher = createCipher(Settings.enc.alg, unsafeKey);

      let filename = originalFile.split('.')[0];
      let ext = Utils.simpleFileExtensions(originalFile.split('.')[1]);

      let expectedOutputFile = originalFile.replace(originalFile.split('.')[1], ext);
      let output = createWriteStream(expectedOutputFile);

      createReadStream(originalFile)
      .pipe(zip)
      .pipe(cipher)
      .pipe(output);

      output.on('finish', function() {
        observer.next('Encrypted file written to disk!');
      });
    });
  }

  DecryptToDisk(encryptedFile: string): Observable<any> {
    return new Observable(observer => {
      let unzip = createGunzip();
      let unsafeKey = this.GetKey();
      let decipher = createDecipher(Settings.enc.alg, unsafeKey);
      let filename = encryptedFile.split('.')[0];
      let ext = Utils.simpleFileExtensions(encryptedFile.split('.')[1]);
      let expectedOutputFile = encryptedFile.replace(encryptedFile.split('.')[1], ext);
      let output = createWriteStream(expectedOutputFile);

      createReadStream(encryptedFile)
      .pipe(decipher)
      .pipe(unzip)
      .pipe(output)
      .on('finish', function() {
        observer.next('Decrypted file written to disk!');
      });
    });
  }

  DecryptToStreamSync(encryptedFile: string, dataContainer: Readable): void {
    let unzip = createGunzip();
    let unsafeKey = this.GetKey();
    let decipher = createDecipher(Settings.enc.alg, unsafeKey);
    let filename = encryptedFile.split('.')[0];
    let ext = Utils.simpleFileExtensions(encryptedFile.split('.')[1]);
    let expectedOutputFile = encryptedFile.replace(encryptedFile.split('.')[1], ext);

    createReadStream(encryptedFile)
    .pipe(decipher)
    .pipe(unzip)
    .on('data', (chunk) => dataContainer.push(chunk))
    .on('error', (err) => console.error(err))
    .on('finish',() => console.log('Decrypted file written to data container'));
  }

  DecryptToStreamAsync(encryptedFile:string): Observable<Readable> {
    return new Observable<Readable>(observer => {
      let tmp = 'output/f.bin';
      if (!existsSync(tmp)) {
        //createWriteStream(tmp);
      }
      let dc = createReadStream(tmp);
      let unzip = createGunzip();
      let unsafeKey = this.GetKey();
      let decipher = createDecipher(Settings.enc.alg, unsafeKey);

      createReadStream(encryptedFile)
      .pipe(decipher)
      .pipe(unzip)
      .on('data', (chunk) => dc.push(chunk))
      .on('error', (err) => observer.error(err))
      .on('finish', () => observer.next(dc));
    });
  }

  private GetKey(): string {
    let safeKey = Settings.enc.key;
    let safeKeyHash = Settings.enc.hash;

    // verify key:hash
    if(md5(safeKey) === safeKeyHash) {
      let UnsafeKey = new Buffer(safeKey, 'base64').toString();
      return UnsafeKey;
    }

    return '';
  }
}
