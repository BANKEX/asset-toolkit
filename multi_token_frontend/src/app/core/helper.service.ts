import { Injectable } from '@angular/core';

@Injectable()
export class HelperService {

  /**
   * Logs any type of data to the console
   * @param  {} title
   * @param  {any[]} data
   */
  public log (title, data: any[]|any) {
    console.warn(title, ':');
    if (data.length) {
      data.forEach(el => {
        el.div ?
          console.log(el.toString(10)) :
          console.log(el);
      })
    } else if (typeof data === 'object') {
      console.log(data);
    } else {
      console.error('No data to logging!')
    }
  }
  public rnd(num) {
    return Math.floor(Math.random() * Math.pow(10, num));
  }
}
