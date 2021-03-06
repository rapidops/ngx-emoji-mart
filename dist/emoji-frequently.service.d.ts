import { EmojiData } from '@ctrl/ngx-emoji-mart/ngx-emoji';
export declare class EmojiFrequentlyService {
    NAMESPACE: string;
    frequently: {
        [key: string]: number;
    } | null;
    defaults: {
        [key: string]: number;
    };
    initialized: boolean;
    DEFAULTS: string[];
    init(isLocalStorageAccessible?: boolean, storageObject?: any): void;
    add(emoji: EmojiData, isLocalStorageAccessible?: boolean, storageObject?: any): void;
    get(perLine: number, totalLines: number, isLocalStorageAccessible?: boolean, storageObject?: any): any[];
}
