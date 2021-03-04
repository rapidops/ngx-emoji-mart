import { Injectable } from '@angular/core';

import { EmojiData } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Injectable({ providedIn: 'root' })
export class EmojiFrequentlyService {
  NAMESPACE = 'emoji-mart';
  frequently: { [key: string]: number } | null = null;
  defaults: { [key: string]: number } = {};
  initialized = false;
  DEFAULTS = [
    '+1',
    'grinning',
    'kissing_heart',
    'heart_eyes',
    'laughing',
    'stuck_out_tongue_winking_eye',
    'sweat_smile',
    'joy',
    'scream',
    'disappointed',
    'unamused',
    'weary',
    'sob',
    'sunglasses',
    'heart',
    'poop',
  ];

  init(isLocalStorageAccessible = true, storageObject: any = {}) {
    if (isLocalStorageAccessible) {
      this.frequently = JSON.parse(localStorage.getItem(`${this.NAMESPACE}.frequently`) || 'null');
    } else {
      this.frequently = JSON.parse(storageObject.getItem(`${this.NAMESPACE}.frequently`) || 'null');
    }
    this.initialized = true;
  }
  add(emoji: EmojiData, isLocalStorageAccessible = true, storageObject: any = {}) {
    if (!this.initialized) {
      this.init(isLocalStorageAccessible, storageObject);
    }
    if (!this.frequently) {
      this.frequently = this.defaults;
    }
    if (!this.frequently[emoji.id]) {
      this.frequently[emoji.id] = 0;
    }
    this.frequently[emoji.id] += 1;

    if (isLocalStorageAccessible) {
      localStorage.setItem(`${this.NAMESPACE}.last`, emoji.id);
      localStorage.setItem(`${this.NAMESPACE}.frequently`, JSON.stringify(this.frequently));
    } else {
      storageObject.setItem(`${this.NAMESPACE}.last`, emoji.id);
      storageObject.setItem(`${this.NAMESPACE}.frequently`, JSON.stringify(this.frequently));
    }
  }
  get(perLine: number, totalLines: number, isLocalStorageAccessible = true, storageObject: any = {}) {
    if (!this.initialized) {
      this.init(isLocalStorageAccessible, storageObject);
    }
    if (this.frequently === null) {
      this.defaults = {};
      const result = [];

      for (let i = 0; i < perLine; i++) {
        this.defaults[this.DEFAULTS[i]] = perLine - i;
        result.push(this.DEFAULTS[i]);
      }
      return result;
    }

    const quantity = perLine * totalLines;
    const frequentlyKeys = Object.keys(this.frequently);

    const sorted = frequentlyKeys
      .sort((a, b) => this.frequently![a] - this.frequently![b])
      .reverse();
    const sliced = sorted.slice(0, quantity);

    let last;
    if (isLocalStorageAccessible) {
      last = localStorage.getItem(`${this.NAMESPACE}.last`);
    } else {
      last = storageObject.getItem(`${this.NAMESPACE}.last`);
    }

    if (last && !sliced.includes(last)) {
      sliced.pop();
      sliced.push(last);
    }
    return sliced;
  }
}
