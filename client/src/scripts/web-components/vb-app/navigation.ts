import * as PubSub from 'pubsub-js';
import { Config } from '../../config';
import { Signal } from './enums';

export type PageUrlParam = {
  name: string;
  value: string;
};

export type PageUrl = {
  name: string;
  param: PageUrlParam[] | string;
};

export class Navigation {
  private url: string;

  checkNaviation() {
    const currentUrl = document.location.href;
    const currentHash = document.location.hash;

    if (currentHash === '') {
      document.location.hash = Config.navigationDefault;
    }

    if (currentUrl === this.url) {
      return;
    }

    this.url = currentUrl;
    const name =
      currentHash.indexOf('/') === -1
        ? currentHash.substring(1)
        : currentHash.substring(1, currentHash.indexOf('/'));

    const param =
      currentHash.indexOf('/') === -1
        ? ''
        : currentHash.substring(name.length + 2);

    console.log('nav param', param);

    PubSub.publish(Signal.UrlChange, {
      name,
      param,
    });
  }

  static navigateTo(page: string, param: PageUrlParam[] | string) {
    if (Array.isArray(param)) {
      const args = param.map(
        (p: PageUrlParam, index: number) =>
          `${index === 0 ? '?' : '&'}${p.name}=${p.value}`
      );
      document.location.hash = `${page}/${args}`;
      return;
    }

    document.location.hash = `${page}/${param}`;
  }

  init(): number {
    return window.setInterval(this.checkNaviation.bind(this), 500);
  }
}
