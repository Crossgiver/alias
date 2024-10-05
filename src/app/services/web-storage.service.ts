import { Injectable } from '@angular/core';
import {WebStorageType} from "../components/enums";

@Injectable({
  providedIn: 'root',
})
export class WebStorageService {
  private storagePrefix = 'ALS';

  set(key: string, value: unknown, storageType: WebStorageType): void {
    let payload;
    if (typeof value === 'string') {
      payload = value;
    } else {
      payload = JSON.stringify(value);
    }

    const handledKey = this.handleKeyByStorageType(storageType, key);
    WebStorageService.getStorageByType(storageType).setItem(handledKey, payload);
  }

  setDestructured(
    payload: Record<string, unknown>,
    storageType: WebStorageType
  ): void {
    for (const [key, value] of Object.entries(payload)) {
      this.set(key, value, storageType);
    }
  }

  get<T>(
    key: string,
    storageType: WebStorageType
  ): T | string | Record<string, unknown> {
    let result;
    const handledKey = this.handleKeyByStorageType(storageType, key);
    const payload =
      WebStorageService.getStorageByType(storageType).getItem(handledKey) || '';
    try {
      result = JSON.parse(payload);
    } catch (error) {
      result = payload;
    }

    return result;
  }

  bulkGet(
    keysArray: string[],
    storageType: WebStorageType
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    keysArray.forEach((key) => {
      result[key] = this.get(key, storageType);
    });
    return result;
  }

  clear(storageType: WebStorageType): void {
    WebStorageService.getStorageByType(storageType).clear();
  }

  remove(key: string, storageType: WebStorageType): void {
    const handledKey = this.handleKeyByStorageType(storageType, key);
    WebStorageService.getStorageByType(storageType).removeItem(handledKey);
  }

  private handleKeyByStorageType(
    storageType: WebStorageType,
    key: string
  ): string {
    return storageType === 'LOCAL' ? `${this.storagePrefix}_${key}` : key;
  }

  private static getStorageByType(storageType: WebStorageType): Storage {
    return storageType === 'SESSION' ? sessionStorage : localStorage;
  }
}
