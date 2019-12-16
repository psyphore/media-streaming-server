import { join, extname } from 'path';
import * as moment from 'moment';
import { Response } from 'express';
import { Stream } from '../server/models/stream.model';
export const Utils = {
  copy: (obj: any): any => {
    return JSON.parse(JSON.stringify(obj));
  },
  momentInTime: (time: string): moment.Moment => {
    let timeObj = moment().hour(+time.split(':')[0])
      .minute(+time.split(':')[1])
      .second(+time.split(':')[2] || 0);
    return timeObj;
  },
  millisecondsToGo: (from: any, to: any): number => {
    let diffTime = moment(to).unix() - moment(from).unix();
    let duration = moment.duration(diffTime * 1, 'seconds');
    return duration.asMilliseconds();
  },
  buildMomentDateTime: (date: string, time: string): moment.Moment => {
    let dmo = moment(date);
    let tmo = this.momentInTime(time);
    let mo = dmo.set({
      'hour': tmo.get('hour'),
      'minute': tmo.get('minute'),
      'second': tmo.get('second'),
    });
    return mo;
  },
  aMoment: (datetime: string): moment.Moment => {
    return moment(datetime);
  },
  equalIgnoreCase: (param1: string, param2: string): Boolean => {
    return (/param1/i).test(param2);
  },
  stripPouchDbFields: (value: any): any => {
    delete value._id;
    delete value._rev;
    delete value.date;
    return value;
  },
  pathExists: (p1: string, p2: string): boolean => {
    return p1.toUpperCase().indexOf(p2.toUpperCase()) !== -1;
  },
  genericSuccessResponse: (data: any, res: Response): void => {
    if (data) {
      res.status(200).json(data);
    } else {
      if (res.statusCode && res.statusCode !== 404) {
        res.status(404).send('Sorry, we cannot find that!');
      }
    }
  },
  genericStreamResponse: (data: Stream, res: Response): void => {
    if (!data || data === null) {
      if (res.statusCode && res.statusCode !== 404) {
        res.status(404).send('Sorry, we cannot find that!');
      }
    } else {
      res.writeHead(200, {
        'Content-Type': data.mime,
        'Content-length': data.size
      });
      data.stream.pipe(res);
    }
  },
  genericServerErrorResponse: (err: any, res: Response): void => {
    res.status(500).json(err);
  },
  simpleFileExtensions: (ext: string): string => {
    let res = '';
    switch (ext) {
      case 'mp4':
        res = 'dbsv';
        break;
      case 'mp3':
      res = 'dbsm';
      break;
      default:
        res = ext;
        break;
    }
    return res;
  },
  simpleRevFileExtensions: (ext: string): string => {
    let res = '';
    switch (ext) {
      case 'dbsv':
        res = 'mp4';
        break;
      case 'dbsm':
      res = 'mp3';
      break;
      default:
        res = ext;
        break;
    }
    return res;
  }

};
