import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild, ViewChildren, } from '@angular/core';
import { categories, } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { EmojiFrequentlyService } from './emoji-frequently.service';
import * as icons from './svgs';
import { measureScrollbar } from './utils';
const I18N = {
    search: 'Search',
    emojilist: 'List of emoji',
    notfound: 'No Emoji Found',
    clear: 'Clear',
    categories: {
        search: 'Search Results',
        recent: 'Frequently Used',
        people: 'Smileys & People',
        nature: 'Animals & Nature',
        foods: 'Food & Drink',
        activity: 'Activity',
        places: 'Travel & Places',
        objects: 'Objects',
        symbols: 'Symbols',
        flags: 'Flags',
        custom: 'Custom',
    },
    skintones: {
        1: 'Default Skin Tone',
        2: 'Light Skin Tone',
        3: 'Medium-Light Skin Tone',
        4: 'Medium Skin Tone',
        5: 'Medium-Dark Skin Tone',
        6: 'Dark Skin Tone',
    },
};
export class PickerComponent {
    constructor(ref, frequently) {
        this.ref = ref;
        this.frequently = frequently;
        this.perLine = 9;
        this.totalFrequentLines = 4;
        this.i18n = {};
        this.style = {};
        this.title = 'Emoji Mart™';
        this.emoji = 'department_store';
        this.darkMode = !!(typeof matchMedia === 'function' &&
            matchMedia('(prefers-color-scheme: dark)').matches);
        this.color = '#ae65c5';
        this.hideObsolete = true;
        /** all categories shown */
        this.categories = [];
        /** used to temporarily draw categories */
        this.activeCategories = [];
        this.set = 'apple';
        this.skin = 1;
        /** Renders the native unicode emoji */
        this.isNative = false;
        this.emojiSize = 24;
        this.sheetSize = 64;
        this.showPreview = true;
        this.emojiTooltip = false;
        this.autoFocus = false;
        this.custom = [];
        this.hideRecent = true;
        this.notFoundEmoji = 'sleuth_or_spy';
        this.categoriesIcons = icons.categories;
        this.searchIcons = icons.search;
        this.useButton = false;
        this.enableFrequentEmojiSort = false;
        this.enableSearch = true;
        this.showSingleCategory = false;
        this.storageObject = {};
        this.isLocalStorageAccessible = true;
        this.emojiClick = new EventEmitter();
        this.emojiSelect = new EventEmitter();
        this.skinChange = new EventEmitter();
        this.scrollHeight = 0;
        this.clientHeight = 0;
        this.firstRender = true;
        this.NAMESPACE = 'emoji-mart';
        this.measureScrollbar = 0;
        this.RECENT_CATEGORY = {
            id: 'recent',
            name: 'Recent',
            emojis: null,
        };
        this.SEARCH_CATEGORY = {
            id: 'search',
            name: 'Search',
            emojis: null,
            anchor: false,
        };
        this.CUSTOM_CATEGORY = {
            id: 'custom',
            name: 'Custom',
            emojis: [],
        };
        this.backgroundImageFn = (set, sheetSize) => `https://unpkg.com/emoji-datasource-${this.set}@5.0.1/img/${this.set}/sheets-256/${this.sheetSize}.png`;
    }
    ngOnInit() {
        // measure scroll
        this.measureScrollbar = measureScrollbar();
        this.i18n = Object.assign(Object.assign({}, I18N), this.i18n);
        this.i18n.categories = Object.assign(Object.assign({}, I18N.categories), this.i18n.categories);
        if (this.isLocalStorageAccessible) {
            this.skin = JSON.parse(localStorage.getItem(`${this.NAMESPACE}.skin`) || 'null') || this.skin;
        }
        else {
            this.skin = this.storageObject.getItem(`${this.NAMESPACE}.skin`) || this.skin;
        }
        const allCategories = [...categories];
        if (this.custom.length > 0) {
            this.CUSTOM_CATEGORY.emojis = this.custom.map(emoji => {
                return Object.assign(Object.assign({}, emoji), { 
                    // `<Category />` expects emoji to have an `id`.
                    id: emoji.shortNames[0], custom: true });
            });
            allCategories.push(this.CUSTOM_CATEGORY);
        }
        if (this.include !== undefined) {
            allCategories.sort((a, b) => {
                if (this.include.indexOf(a.id) > this.include.indexOf(b.id)) {
                    return 1;
                }
                return -1;
            });
        }
        for (const category of allCategories) {
            const isIncluded = this.include && this.include.length
                ? this.include.indexOf(category.id) > -1
                : true;
            const isExcluded = this.exclude && this.exclude.length
                ? this.exclude.indexOf(category.id) > -1
                : false;
            if (!isIncluded || isExcluded) {
                continue;
            }
            if (this.emojisToShowFilter) {
                const newEmojis = [];
                const { emojis } = category;
                // tslint:disable-next-line: prefer-for-of
                for (let emojiIndex = 0; emojiIndex < emojis.length; emojiIndex++) {
                    const emoji = emojis[emojiIndex];
                    if (this.emojisToShowFilter(emoji)) {
                        newEmojis.push(emoji);
                    }
                }
                if (newEmojis.length) {
                    const newCategory = {
                        emojis: newEmojis,
                        name: category.name,
                        id: category.id,
                    };
                    this.categories.push(newCategory);
                }
            }
            else {
                this.categories.push(category);
            }
            this.categoriesIcons = Object.assign(Object.assign({}, icons.categories), this.categoriesIcons);
            this.searchIcons = Object.assign(Object.assign({}, icons.search), this.searchIcons);
        }
        const includeRecent = this.include && this.include.length
            ? this.include.indexOf(this.RECENT_CATEGORY.id) > -1
            : true;
        const excludeRecent = this.exclude && this.exclude.length
            ? this.exclude.indexOf(this.RECENT_CATEGORY.id) > -1
            : false;
        if (includeRecent && !excludeRecent) {
            this.hideRecent = false;
            this.categories.unshift(this.RECENT_CATEGORY);
        }
        if (this.categories[0]) {
            this.categories[0].first = true;
        }
        this.categories.unshift(this.SEARCH_CATEGORY);
        this.selected = this.categories.filter(category => category.first)[0].name;
        // Need to be careful if small number of categories
        const categoriesToLoadFirst = Math.min(this.categories.length, 3);
        this.setActiveCategories(this.activeCategories = this.categories.slice(0, categoriesToLoadFirst));
        // Trim last active category
        const lastActiveCategoryEmojis = this.categories[categoriesToLoadFirst - 1].emojis.slice();
        this.categories[categoriesToLoadFirst - 1].emojis = lastActiveCategoryEmojis.slice(0, 60);
        this.ref.markForCheck();
        setTimeout(() => {
            // Restore last category
            this.categories[categoriesToLoadFirst - 1].emojis = lastActiveCategoryEmojis;
            this.setActiveCategories(this.categories);
            this.ref.markForCheck();
            setTimeout(() => this.updateCategoriesSize());
        });
    }
    setActiveCategories(categoriesToMakeActive) {
        if (this.showSingleCategory) {
            this.activeCategories = categoriesToMakeActive.filter(x => (x.name === this.selected || x === this.SEARCH_CATEGORY));
        }
        else {
            this.activeCategories = categoriesToMakeActive;
        }
    }
    updateCategoriesSize() {
        this.categoryRefs.forEach(component => component.memoizeSize());
        if (this.scrollRef) {
            const target = this.scrollRef.nativeElement;
            this.scrollHeight = target.scrollHeight;
            this.clientHeight = target.clientHeight;
        }
    }
    handleAnchorClick($event) {
        this.updateCategoriesSize();
        this.selected = $event.category.name;
        this.setActiveCategories(this.categories);
        if (this.SEARCH_CATEGORY.emojis) {
            this.handleSearch(null);
            this.searchRef.clear();
            this.handleAnchorClick($event);
            return;
        }
        const component = this.categoryRefs.find(n => n.id === $event.category.id);
        if (component) {
            let { top } = component;
            if ($event.category.first) {
                top = 0;
            }
            else {
                top += 1;
            }
            this.scrollRef.nativeElement.scrollTop = top;
        }
        this.selected = $event.category.name;
        this.nextScroll = $event.category.name;
    }
    categoryTrack(index, item) {
        return item.id;
    }
    handleScroll() {
        if (this.nextScroll) {
            this.selected = this.nextScroll;
            this.nextScroll = undefined;
            return;
        }
        if (!this.scrollRef) {
            return;
        }
        if (this.showSingleCategory) {
            return;
        }
        let activeCategory = null;
        if (this.SEARCH_CATEGORY.emojis) {
            activeCategory = this.SEARCH_CATEGORY;
        }
        else {
            const target = this.scrollRef.nativeElement;
            // check scroll is not at bottom
            if (target.scrollTop === 0) {
                // hit the TOP
                activeCategory = this.categories.find(n => n.first === true);
            }
            else if (target.scrollHeight - target.scrollTop === this.clientHeight) {
                // scrolled to bottom activate last category
                activeCategory = this.categories[this.categories.length - 1];
            }
            else {
                // scrolling
                for (const category of this.categories) {
                    const component = this.categoryRefs.find(n => n.id === category.id);
                    const active = component.handleScroll(target.scrollTop);
                    if (active) {
                        activeCategory = category;
                    }
                }
            }
            this.scrollTop = target.scrollTop;
        }
        if (activeCategory) {
            this.selected = activeCategory.name;
        }
    }
    handleSearch($emojis) {
        this.SEARCH_CATEGORY.emojis = $emojis;
        for (const component of this.categoryRefs.toArray()) {
            if (component.name === 'Search') {
                component.emojis = $emojis;
                component.updateDisplay($emojis ? 'block' : 'none');
            }
            else {
                component.updateDisplay($emojis ? 'none' : 'block');
            }
        }
        this.scrollRef.nativeElement.scrollTop = 0;
        this.handleScroll();
    }
    handleEnterKey($event, emoji) {
        if (!emoji) {
            if (this.SEARCH_CATEGORY.emojis !== null && this.SEARCH_CATEGORY.emojis.length) {
                emoji = this.SEARCH_CATEGORY.emojis[0];
                if (emoji) {
                    this.emojiSelect.emit({ $event, emoji });
                }
                else {
                    return;
                }
            }
        }
        if (!this.hideRecent && !this.recent && emoji) {
            this.frequently.add(emoji, this.isLocalStorageAccessible, this.storageObject);
        }
        const component = this.categoryRefs.toArray()[1];
        if (component && this.enableFrequentEmojiSort) {
            component.getEmojis();
            component.ref.markForCheck();
        }
    }
    handleEmojiOver($event) {
        if (!this.showPreview || !this.previewRef) {
            return;
        }
        const emojiData = this.CUSTOM_CATEGORY.emojis.find((customEmoji) => customEmoji.id === $event.emoji.id);
        if (emojiData) {
            $event.emoji = Object.assign({}, emojiData);
        }
        this.previewEmoji = $event.emoji;
        clearTimeout(this.leaveTimeout);
    }
    handleEmojiLeave() {
        if (!this.showPreview || !this.previewRef) {
            return;
        }
        this.leaveTimeout = setTimeout(() => {
            this.previewEmoji = null;
            this.previewRef.ref.markForCheck();
        }, 16);
    }
    handleEmojiClick($event) {
        this.emojiClick.emit($event);
        this.emojiSelect.emit($event);
        this.handleEnterKey($event.$event, $event.emoji);
    }
    handleSkinChange(skin) {
        this.skin = skin;
        if (this.isLocalStorageAccessible) {
            localStorage.setItem(`${this.NAMESPACE}.skin`, String(skin));
        }
        else {
            this.storageObject.setItem(`${this.NAMESPACE}.skin`, String(skin));
        }
        this.skinChange.emit(skin);
    }
    getWidth() {
        if (this.style && this.style.width) {
            return this.style.width;
        }
        return this.perLine * (this.emojiSize + 12) + 12 + 2 + this.measureScrollbar + 'px';
    }
}
PickerComponent.decorators = [
    { type: Component, args: [{
                selector: 'emoji-mart',
                template: "<section class=\"emoji-mart {{ darkMode ? 'emoji-mart-dark' : '' }}\"\n  [style.width]=\"getWidth()\"\n  [ngStyle]=\"style\">\n  <div class=\"emoji-mart-bar\">\n    <emoji-mart-anchors\n      [categories]=\"categories\"\n      (anchorClick)=\"handleAnchorClick($event)\"\n      [color]=\"color\"\n      [selected]=\"selected\"\n      [i18n]=\"i18n\"\n      [icons]=\"categoriesIcons\"\n    ></emoji-mart-anchors>\n  </div>\n  <emoji-search\n    *ngIf=\"enableSearch\"\n    #searchRef\n    [i18n]=\"i18n\"\n    (searchResults)=\"handleSearch($event)\"\n    (enterKey)=\"handleEnterKey($event)\"\n    [include]=\"include\"\n    [exclude]=\"exclude\"\n    [custom]=\"custom\"\n    [autoFocus]=\"autoFocus\"\n    [icons]=\"searchIcons\"\n    [emojisToShowFilter]=\"emojisToShowFilter\"\n  ></emoji-search>\n  <section #scrollRef class=\"emoji-mart-scroll\" (scroll)=\"handleScroll()\" [attr.aria-label]=\"i18n.emojilist\">\n    <emoji-category\n      *ngFor=\"let category of activeCategories; let idx = index; trackBy: categoryTrack\"\n      #categoryRef\n      [id]=\"category.id\"\n      [name]=\"category.name\"\n      [emojis]=\"category.emojis\"\n      [perLine]=\"perLine\"\n      [totalFrequentLines]=\"totalFrequentLines\"\n      [hasStickyPosition]=\"isNative\"\n      [i18n]=\"i18n\"\n      [hideObsolete]=\"hideObsolete\"\n      [notFoundEmoji]=\"notFoundEmoji\"\n      [custom]=\"category.id == RECENT_CATEGORY.id ? CUSTOM_CATEGORY.emojis : undefined\"\n      [recent]=\"category.id == RECENT_CATEGORY.id ? recent : undefined\"\n      [emojiIsNative]=\"isNative\"\n      [emojiSkin]=\"skin\"\n      [emojiSize]=\"emojiSize\"\n      [emojiSet]=\"set\"\n      [isLocalStorageAccessible]=\"isLocalStorageAccessible\"\n      [storageObject]=\"storageObject\"\n      [emojiSheetSize]=\"sheetSize\"\n      [emojiForceSize]=\"isNative\"\n      [emojiTooltip]=\"emojiTooltip\"\n      [emojiBackgroundImageFn]=\"backgroundImageFn\"\n      [emojiUseButton]=\"false\"\n      (emojiOver)=\"handleEmojiOver($event)\"\n      (emojiLeave)=\"handleEmojiLeave()\"\n      (emojiClick)=\"handleEmojiClick($event)\"\n    ></emoji-category>\n  </section>\n  <div class=\"emoji-mart-bar\" *ngIf=\"showPreview\">\n    <emoji-preview\n      #previewRef\n      [title]=\"title\"\n      [emoji]=\"previewEmoji\"\n      [idleEmoji]=\"emoji\"\n      [emojiIsNative]=\"isNative\"\n      [emojiSize]=\"38\"\n      [emojiSkin]=\"skin\"\n      [emojiSet]=\"set\"\n      [i18n]=\"i18n\"\n      [emojiSheetSize]=\"sheetSize\"\n      [emojiBackgroundImageFn]=\"backgroundImageFn\"\n      (skinChange)=\"handleSkinChange($event)\"\n    ></emoji-preview>\n  </div>\n</section>\n",
                changeDetection: ChangeDetectionStrategy.OnPush,
                preserveWhitespaces: false
            },] }
];
PickerComponent.ctorParameters = () => [
    { type: ChangeDetectorRef },
    { type: EmojiFrequentlyService }
];
PickerComponent.propDecorators = {
    perLine: [{ type: Input }],
    totalFrequentLines: [{ type: Input }],
    i18n: [{ type: Input }],
    style: [{ type: Input }],
    title: [{ type: Input }],
    emoji: [{ type: Input }],
    darkMode: [{ type: Input }],
    color: [{ type: Input }],
    hideObsolete: [{ type: Input }],
    categories: [{ type: Input }],
    activeCategories: [{ type: Input }],
    set: [{ type: Input }],
    skin: [{ type: Input }],
    isNative: [{ type: Input }],
    emojiSize: [{ type: Input }],
    sheetSize: [{ type: Input }],
    emojisToShowFilter: [{ type: Input }],
    showPreview: [{ type: Input }],
    emojiTooltip: [{ type: Input }],
    autoFocus: [{ type: Input }],
    custom: [{ type: Input }],
    hideRecent: [{ type: Input }],
    include: [{ type: Input }],
    exclude: [{ type: Input }],
    notFoundEmoji: [{ type: Input }],
    categoriesIcons: [{ type: Input }],
    searchIcons: [{ type: Input }],
    useButton: [{ type: Input }],
    enableFrequentEmojiSort: [{ type: Input }],
    enableSearch: [{ type: Input }],
    showSingleCategory: [{ type: Input }],
    storageObject: [{ type: Input }],
    isLocalStorageAccessible: [{ type: Input }],
    emojiClick: [{ type: Output }],
    emojiSelect: [{ type: Output }],
    skinChange: [{ type: Output }],
    scrollRef: [{ type: ViewChild, args: ['scrollRef', { static: true },] }],
    previewRef: [{ type: ViewChild, args: ['previewRef',] }],
    searchRef: [{ type: ViewChild, args: ['searchRef', { static: true },] }],
    categoryRefs: [{ type: ViewChildren, args: ['categoryRef',] }],
    backgroundImageFn: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlja2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvcGlja2VyL3BpY2tlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUVULFlBQVksRUFDWixLQUFLLEVBRUwsTUFBTSxFQUVOLFNBQVMsRUFDVCxZQUFZLEdBQ2IsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUNMLFVBQVUsR0FLWCxNQUFNLGdDQUFnQyxDQUFDO0FBRXhDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBR3BFLE9BQU8sS0FBSyxLQUFLLE1BQU0sUUFBUSxDQUFDO0FBQ2hDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUkzQyxNQUFNLElBQUksR0FBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixTQUFTLEVBQUUsZUFBZTtJQUMxQixRQUFRLEVBQUUsZ0JBQWdCO0lBQzFCLEtBQUssRUFBRSxPQUFPO0lBQ2QsVUFBVSxFQUFFO1FBQ1YsTUFBTSxFQUFFLGdCQUFnQjtRQUN4QixNQUFNLEVBQUUsaUJBQWlCO1FBQ3pCLE1BQU0sRUFBRSxrQkFBa0I7UUFDMUIsTUFBTSxFQUFFLGtCQUFrQjtRQUMxQixLQUFLLEVBQUUsY0FBYztRQUNyQixRQUFRLEVBQUUsVUFBVTtRQUNwQixNQUFNLEVBQUUsaUJBQWlCO1FBQ3pCLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLEtBQUssRUFBRSxPQUFPO1FBQ2QsTUFBTSxFQUFFLFFBQVE7S0FDakI7SUFDRCxTQUFTLEVBQUU7UUFDVCxDQUFDLEVBQUUsbUJBQW1CO1FBQ3RCLENBQUMsRUFBRSxpQkFBaUI7UUFDcEIsQ0FBQyxFQUFFLHdCQUF3QjtRQUMzQixDQUFDLEVBQUUsa0JBQWtCO1FBQ3JCLENB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V0FBVyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTsyQkFDdkMsWUFBWSxTQUFDLGFBQWE7Z0NBNkIxQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBRdWVyeUxpc3QsXG4gIFZpZXdDaGlsZCxcbiAgVmlld0NoaWxkcmVuLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtcbiAgY2F0ZWdvcmllcyxcbiAgRW1vamksXG4gIEVtb2ppQ2F0ZWdvcnksXG4gIEVtb2ppRGF0YSxcbiAgRW1vamlFdmVudCxcbn0gZnJvbSAnQGN0cmwvbmd4LWVtb2ppLW1hcnQvbmd4LWVtb2ppJztcbmltcG9ydCB7IENhdGVnb3J5Q29tcG9uZW50IH0gZnJvbSAnLi9jYXRlZ29yeS5jb21wb25lbnQnO1xuaW1wb3J0IHsgRW1vamlGcmVxdWVudGx5U2VydmljZSB9IGZyb20gJy4vZW1vamktZnJlcXVlbnRseS5zZXJ2aWNlJztcbmltcG9ydCB7IFByZXZpZXdDb21wb25lbnQgfSBmcm9tICcuL3ByZXZpZXcuY29tcG9uZW50JztcbmltcG9ydCB7IFNlYXJjaENvbXBvbmVudCB9IGZyb20gJy4vc2VhcmNoLmNvbXBvbmVudCc7XG5pbXBvcnQgKiBhcyBpY29ucyBmcm9tICcuL3N2Z3MnO1xuaW1wb3J0IHsgbWVhc3VyZVNjcm9sbGJhciB9IGZyb20gJy4vdXRpbHMnO1xuXG5cblxuY29uc3QgSTE4TjogYW55ID0ge1xuICBzZWFyY2g6ICdTZWFyY2gnLFxuICBlbW9qaWxpc3Q6ICdMaXN0IG9mIGVtb2ppJyxcbiAgbm90Zm91bmQ6ICdObyBFbW9qaSBGb3VuZCcsXG4gIGNsZWFyOiAnQ2xlYXInLFxuICBjYXRlZ29yaWVzOiB7XG4gICAgc2VhcmNoOiAnU2VhcmNoIFJlc3VsdHMnLFxuICAgIHJlY2VudDogJ0ZyZXF1ZW50bHkgVXNlZCcsXG4gICAgcGVvcGxlOiAnU21pbGV5cyAmIFBlb3BsZScsXG4gICAgbmF0dXJlOiAnQW5pbWFscyAmIE5hdHVyZScsXG4gICAgZm9vZHM6ICdGb29kICYgRHJpbmsnLFxuICAgIGFjdGl2aXR5OiAnQWN0aXZpdHknLFxuICAgIHBsYWNlczogJ1RyYXZlbCAmIFBsYWNlcycsXG4gICAgb2JqZWN0czogJ09iamVjdHMnLFxuICAgIHN5bWJvbHM6ICdTeW1ib2xzJyxcbiAgICBmbGFnczogJ0ZsYWdzJyxcbiAgICBjdXN0b206ICdDdXN0b20nLFxuICB9LFxuICBza2ludG9uZXM6IHtcbiAgICAxOiAnRGVmYXVsdCBTa2luIFRvbmUnLFxuICAgIDI6ICdMaWdodCBTa2luIFRvbmUnLFxuICAgIDM6ICdNZWRpdW0tTGlnaHQgU2tpbiBUb25lJyxcbiAgICA0OiAnTWVkaXVtIFNraW4gVG9uZScsXG4gICAgNTogJ01lZGl1bS1EYXJrIFNraW4gVG9uZScsXG4gICAgNjogJ0RhcmsgU2tpbiBUb25lJyxcbiAgfSxcbn07XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2Vtb2ppLW1hcnQnLFxuICB0ZW1wbGF0ZVVybDogJy4vcGlja2VyLmNvbXBvbmVudC5odG1sJyxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIHByZXNlcnZlV2hpdGVzcGFjZXM6IGZhbHNlLFxufSlcbmV4cG9ydCBjbGFzcyBQaWNrZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBASW5wdXQoKSBwZXJMaW5lID0gOTtcbiAgQElucHV0KCkgdG90YWxGcmVxdWVudExpbmVzID0gNDtcbiAgQElucHV0KCkgaTE4bjogYW55ID0ge307XG4gIEBJbnB1dCgpIHN0eWxlOiBhbnkgPSB7fTtcbiAgQElucHV0KCkgdGl0bGUgPSAnRW1vamkgTWFydOKEoic7XG4gIEBJbnB1dCgpIGVtb2ppID0gJ2RlcGFydG1lbnRfc3RvcmUnO1xuICBASW5wdXQoKSBkYXJrTW9kZSA9ICEhKFxuICAgIHR5cGVvZiBtYXRjaE1lZGlhID09PSAnZnVuY3Rpb24nICYmXG4gICAgbWF0Y2hNZWRpYSgnKHByZWZlcnMtY29sb3Itc2NoZW1lOiBkYXJrKScpLm1hdGNoZXNcbiAgKTtcbiAgQElucHV0KCkgY29sb3IgPSAnI2FlNjVjNSc7XG4gIEBJbnB1dCgpIGhpZGVPYnNvbGV0ZSA9IHRydWU7XG4gIC8qKiBhbGwgY2F0ZWdvcmllcyBzaG93biAqL1xuICBASW5wdXQoKSBjYXRlZ29yaWVzOiBFbW9qaUNhdGVnb3J5W10gPSBbXTtcbiAgLyoqIHVzZWQgdG8gdGVtcG9yYXJpbHkgZHJhdyBjYXRlZ29yaWVzICovXG4gIEBJbnB1dCgpIGFjdGl2ZUNhdGVnb3JpZXM6IEVtb2ppQ2F0ZWdvcnlbXSA9IFtdO1xuICBASW5wdXQoKSBzZXQ6IEVtb2ppWydzZXQnXSA9ICdhcHBsZSc7XG4gIEBJbnB1dCgpIHNraW46IEVtb2ppWydza2luJ10gPSAxO1xuICAvKiogUmVuZGVycyB0aGUgbmF0aXZlIHVuaWNvZGUgZW1vamkgKi9cbiAgQElucHV0KCkgaXNOYXRpdmU6IEVtb2ppWydpc05hdGl2ZSddID0gZmFsc2U7XG4gIEBJbnB1dCgpIGVtb2ppU2l6ZTogRW1vamlbJ3NpemUnXSA9IDI0O1xuICBASW5wdXQoKSBzaGVldFNpemU6IEVtb2ppWydzaGVldFNpemUnXSA9IDY0O1xuICBASW5wdXQoKSBlbW9qaXNUb1Nob3dGaWx0ZXI/OiAoeDogc3RyaW5nKSA9PiBib29sZWFuO1xuICBASW5wdXQoKSBzaG93UHJldmlldyA9IHRydWU7XG4gIEBJbnB1dCgpIGVtb2ppVG9vbHRpcCA9IGZhbHNlO1xuICBASW5wdXQoKSBhdXRvRm9jdXMgPSBmYWxzZTtcbiAgQElucHV0KCkgY3VzdG9tOiBhbnlbXSA9IFtdO1xuICBASW5wdXQoKSBoaWRlUmVjZW50ID0gdHJ1ZTtcbiAgQElucHV0KCkgaW5jbHVkZT86IHN0cmluZ1tdO1xuICBASW5wdXQoKSBleGNsdWRlPzogc3RyaW5nW107XG4gIEBJbnB1dCgpIG5vdEZvdW5kRW1vamkgPSAnc2xldXRoX29yX3NweSc7XG4gIEBJbnB1dCgpIGNhdGVnb3JpZXNJY29ucyA9IGljb25zLmNhdGVnb3JpZXM7XG4gIEBJbnB1dCgpIHNlYXJjaEljb25zID0gaWNvbnMuc2VhcmNoO1xuICBASW5wdXQoKSB1c2VCdXR0b24gPSBmYWxzZTtcbiAgQElucHV0KCkgZW5hYmxlRnJlcXVlbnRFbW9qaVNvcnQgPSBmYWxzZTtcbiAgQElucHV0KCkgZW5hYmxlU2VhcmNoID0gdHJ1ZTtcbiAgQElucHV0KCkgc2hvd1NpbmdsZUNhdGVnb3J5ID0gZmFsc2U7XG4gIEBJbnB1dCgpIHN0b3JhZ2VPYmplY3Q6IGFueSA9IHt9O1xuICBASW5wdXQoKSBpc0xvY2FsU3RvcmFnZUFjY2Vzc2libGUgPSB0cnVlO1xuICBAT3V0cHV0KCkgZW1vamlDbGljayA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCkgZW1vamlTZWxlY3QgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgpIHNraW5DaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPEVtb2ppWydza2luJ10+KCk7XG4gIEBWaWV3Q2hpbGQoJ3Njcm9sbFJlZicsIHsgc3RhdGljOiB0cnVlIH0pIHByaXZhdGUgc2Nyb2xsUmVmITogRWxlbWVudFJlZjtcbiAgQFZpZXdDaGlsZCgncHJldmlld1JlZicpIHByaXZhdGUgcHJldmlld1JlZiE6IFByZXZpZXdDb21wb25lbnQ7XG4gIEBWaWV3Q2hpbGQoJ3NlYXJjaFJlZicsIHsgc3RhdGljOiB0cnVlIH0pIHByaXZhdGUgc2VhcmNoUmVmITogU2VhcmNoQ29tcG9uZW50O1xuICBAVmlld0NoaWxkcmVuKCdjYXRlZ29yeVJlZicpIHByaXZhdGUgY2F0ZWdvcnlSZWZzITogUXVlcnlMaXN0PENhdGVnb3J5Q29tcG9uZW50PjtcbiAgc2Nyb2xsSGVpZ2h0ID0gMDtcbiAgY2xpZW50SGVpZ2h0ID0gMDtcbiAgc2VsZWN0ZWQ/OiBzdHJpbmc7XG4gIG5leHRTY3JvbGw/OiBzdHJpbmc7XG4gIHNjcm9sbFRvcD86IG51bWJlcjtcbiAgZmlyc3RSZW5kZXIgPSB0cnVlO1xuICByZWNlbnQ/OiBzdHJpbmdbXTtcbiAgcHJldmlld0Vtb2ppOiBhbnk7XG4gIGxlYXZlVGltZW91dDogYW55O1xuICBOQU1FU1BBQ0UgPSAnZW1vamktbWFydCc7XG4gIG1lYXN1cmVTY3JvbGxiYXIgPSAwO1xuICBSRUNFTlRfQ0FURUdPUlk6IEVtb2ppQ2F0ZWdvcnkgPSB7XG4gICAgaWQ6ICdyZWNlbnQnLFxuICAgIG5hbWU6ICdSZWNlbnQnLFxuICAgIGVtb2ppczogbnVsbCxcbiAgfTtcbiAgU0VBUkNIX0NBVEVHT1JZOiBFbW9qaUNhdGVnb3J5ID0ge1xuICAgIGlkOiAnc2VhcmNoJyxcbiAgICBuYW1lOiAnU2VhcmNoJyxcbiAgICBlbW9qaXM6IG51bGwsXG4gICAgYW5jaG9yOiBmYWxzZSxcbiAgfTtcbiAgQ1VTVE9NX0NBVEVHT1JZOiBFbW9qaUNhdGVnb3J5ID0ge1xuICAgIGlkOiAnY3VzdG9tJyxcbiAgICBuYW1lOiAnQ3VzdG9tJyxcbiAgICBlbW9qaXM6IFtdLFxuICB9O1xuXG4gIEBJbnB1dCgpXG4gIGJhY2tncm91bmRJbWFnZUZuOiBFbW9qaVsnYmFja2dyb3VuZEltYWdlRm4nXSA9IChcbiAgICBzZXQ6IHN0cmluZyxcbiAgICBzaGVldFNpemU6IG51bWJlcixcbiAgKSA9PlxuICAgIGBodHRwczovL3VucGtnLmNvbS9lbW9qaS1kYXRhc291cmNlLSR7dGhpcy5zZXR9QDUuMC4xL2ltZy8ke3RoaXMuc2V0fS9zaGVldHMtMjU2LyR7dGhpcy5zaGVldFNpemV9LnBuZ2BcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBmcmVxdWVudGx5OiBFbW9qaUZyZXF1ZW50bHlTZXJ2aWNlLFxuICApIHt9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gbWVhc3VyZSBzY3JvbGxcbiAgICB0aGlzLm1lYXN1cmVTY3JvbGxiYXIgPSBtZWFzdXJlU2Nyb2xsYmFyKCk7XG5cbiAgICB0aGlzLmkxOG4gPSB7IC4uLkkxOE4sIC4uLnRoaXMuaTE4biB9O1xuICAgIHRoaXMuaTE4bi5jYXRlZ29yaWVzID0geyAuLi5JMThOLmNhdGVnb3JpZXMsIC4uLnRoaXMuaTE4bi5jYXRlZ29yaWVzIH07XG4gICAgaWYgKHRoaXMuaXNMb2NhbFN0b3JhZ2VBY2Nlc3NpYmxlKSB7XG4gICAgICB0aGlzLnNraW4gPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGAke3RoaXMuTkFNRVNQQUNFfS5za2luYCkgfHwgJ251bGwnKSB8fCB0aGlzLnNraW47XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2tpbiA9IHRoaXMuc3RvcmFnZU9iamVjdC5nZXRJdGVtKGAke3RoaXMuTkFNRVNQQUNFfS5za2luYCkgfHwgdGhpcy5za2luO1xuICAgIH1cblxuICAgIGNvbnN0IGFsbENhdGVnb3JpZXMgPSBbLi4uY2F0ZWdvcmllc107XG5cbiAgICBpZiAodGhpcy5jdXN0b20ubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5DVVNUT01fQ0FURUdPUlkuZW1vamlzID0gdGhpcy5jdXN0b20ubWFwKGVtb2ppID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5lbW9qaSxcbiAgICAgICAgICAvLyBgPENhdGVnb3J5IC8+YCBleHBlY3RzIGVtb2ppIHRvIGhhdmUgYW4gYGlkYC5cbiAgICAgICAgICBpZDogZW1vamkuc2hvcnROYW1lc1swXSxcbiAgICAgICAgICBjdXN0b206IHRydWUsXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgYWxsQ2F0ZWdvcmllcy5wdXNoKHRoaXMuQ1VTVE9NX0NBVEVHT1JZKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbmNsdWRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFsbENhdGVnb3JpZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICBpZiAodGhpcy5pbmNsdWRlIS5pbmRleE9mKGEuaWQpID4gdGhpcy5pbmNsdWRlIS5pbmRleE9mKGIuaWQpKSB7XG4gICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBjYXRlZ29yeSBvZiBhbGxDYXRlZ29yaWVzKSB7XG4gICAgICBjb25zdCBpc0luY2x1ZGVkID1cbiAgICAgICAgdGhpcy5pbmNsdWRlICYmIHRoaXMuaW5jbHVkZS5sZW5ndGhcbiAgICAgICAgICA/IHRoaXMuaW5jbHVkZS5pbmRleE9mKGNhdGVnb3J5LmlkKSA+IC0xXG4gICAgICAgICAgOiB0cnVlO1xuICAgICAgY29uc3QgaXNFeGNsdWRlZCA9XG4gICAgICAgIHRoaXMuZXhjbHVkZSAmJiB0aGlzLmV4Y2x1ZGUubGVuZ3RoXG4gICAgICAgICAgPyB0aGlzLmV4Y2x1ZGUuaW5kZXhPZihjYXRlZ29yeS5pZCkgPiAtMVxuICAgICAgICAgIDogZmFsc2U7XG4gICAgICBpZiAoIWlzSW5jbHVkZWQgfHwgaXNFeGNsdWRlZCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuZW1vamlzVG9TaG93RmlsdGVyKSB7XG4gICAgICAgIGNvbnN0IG5ld0Vtb2ppcyA9IFtdO1xuXG4gICAgICAgIGNvbnN0IHsgZW1vamlzIH0gPSBjYXRlZ29yeTtcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBwcmVmZXItZm9yLW9mXG4gICAgICAgIGZvciAobGV0IGVtb2ppSW5kZXggPSAwOyBlbW9qaUluZGV4IDwgZW1vamlzIS5sZW5ndGg7IGVtb2ppSW5kZXgrKykge1xuICAgICAgICAgIGNvbnN0IGVtb2ppID0gZW1vamlzIVtlbW9qaUluZGV4XTtcbiAgICAgICAgICBpZiAodGhpcy5lbW9qaXNUb1Nob3dGaWx0ZXIoZW1vamkpKSB7XG4gICAgICAgICAgICBuZXdFbW9qaXMucHVzaChlbW9qaSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5ld0Vtb2ppcy5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zdCBuZXdDYXRlZ29yeSA9IHtcbiAgICAgICAgICAgIGVtb2ppczogbmV3RW1vamlzLFxuICAgICAgICAgICAgbmFtZTogY2F0ZWdvcnkubmFtZSxcbiAgICAgICAgICAgIGlkOiBjYXRlZ29yeS5pZCxcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgdGhpcy5jYXRlZ29yaWVzLnB1c2gobmV3Q2F0ZWdvcnkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNhdGVnb3JpZXMucHVzaChjYXRlZ29yeSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2F0ZWdvcmllc0ljb25zID0geyAuLi5pY29ucy5jYXRlZ29yaWVzLCAuLi50aGlzLmNhdGVnb3JpZXNJY29ucyB9O1xuICAgICAgdGhpcy5zZWFyY2hJY29ucyA9IHsgLi4uaWNvbnMuc2VhcmNoLCAuLi50aGlzLnNlYXJjaEljb25zIH07XG4gICAgfVxuXG4gICAgY29uc3QgaW5jbHVkZVJlY2VudCA9XG4gICAgICB0aGlzLmluY2x1ZGUgJiYgdGhpcy5pbmNsdWRlLmxlbmd0aFxuICAgICAgICA/IHRoaXMuaW5jbHVkZS5pbmRleE9mKHRoaXMuUkVDRU5UX0NBVEVHT1JZLmlkKSA+IC0xXG4gICAgICAgIDogdHJ1ZTtcbiAgICBjb25zdCBleGNsdWRlUmVjZW50ID1cbiAgICAgIHRoaXMuZXhjbHVkZSAmJiB0aGlzLmV4Y2x1ZGUubGVuZ3RoXG4gICAgICAgID8gdGhpcy5leGNsdWRlLmluZGV4T2YodGhpcy5SRUNFTlRfQ0FURUdPUlkuaWQpID4gLTFcbiAgICAgICAgOiBmYWxzZTtcbiAgICBpZiAoaW5jbHVkZVJlY2VudCAmJiAhZXhjbHVkZVJlY2VudCkge1xuICAgICAgdGhpcy5oaWRlUmVjZW50ID0gZmFsc2U7XG4gICAgICB0aGlzLmNhdGVnb3JpZXMudW5zaGlmdCh0aGlzLlJFQ0VOVF9DQVRFR09SWSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2F0ZWdvcmllc1swXSkge1xuICAgICAgdGhpcy5jYXRlZ29yaWVzWzBdLmZpcnN0ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLmNhdGVnb3JpZXMudW5zaGlmdCh0aGlzLlNFQVJDSF9DQVRFR09SWSk7XG4gICAgdGhpcy5zZWxlY3RlZCA9IHRoaXMuY2F0ZWdvcmllcy5maWx0ZXIoY2F0ZWdvcnkgPT4gY2F0ZWdvcnkuZmlyc3QpWzBdLm5hbWU7XG5cbiAgICAvLyBOZWVkIHRvIGJlIGNhcmVmdWwgaWYgc21hbGwgbnVtYmVyIG9mIGNhdGVnb3JpZXNcbiAgICBjb25zdCBjYXRlZ29yaWVzVG9Mb2FkRmlyc3QgPSBNYXRoLm1pbih0aGlzLmNhdGVnb3JpZXMubGVuZ3RoLCAzKTtcbiAgICB0aGlzLnNldEFjdGl2ZUNhdGVnb3JpZXModGhpcy5hY3RpdmVDYXRlZ29yaWVzID0gdGhpcy5jYXRlZ29yaWVzLnNsaWNlKDAsIGNhdGVnb3JpZXNUb0xvYWRGaXJzdCkpO1xuXG4gICAgLy8gVHJpbSBsYXN0IGFjdGl2ZSBjYXRlZ29yeVxuICAgIGNvbnN0IGxhc3RBY3RpdmVDYXRlZ29yeUVtb2ppcyA9IHRoaXMuY2F0ZWdvcmllc1tjYXRlZ29yaWVzVG9Mb2FkRmlyc3QgLSAxXS5lbW9qaXMhLnNsaWNlKCk7XG4gICAgdGhpcy5jYXRlZ29yaWVzW2NhdGVnb3JpZXNUb0xvYWRGaXJzdCAtIDFdLmVtb2ppcyA9IGxhc3RBY3RpdmVDYXRlZ29yeUVtb2ppcy5zbGljZSgwLCA2MCk7XG5cbiAgICB0aGlzLnJlZi5tYXJrRm9yQ2hlY2soKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgLy8gUmVzdG9yZSBsYXN0IGNhdGVnb3J5XG4gICAgICB0aGlzLmNhdGVnb3JpZXNbY2F0ZWdvcmllc1RvTG9hZEZpcnN0IC0gMV0uZW1vamlzID0gbGFzdEFjdGl2ZUNhdGVnb3J5RW1vamlzO1xuICAgICAgdGhpcy5zZXRBY3RpdmVDYXRlZ29yaWVzKHRoaXMuY2F0ZWdvcmllcyk7XG4gICAgICB0aGlzLnJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGVDYXRlZ29yaWVzU2l6ZSgpKTtcbiAgICB9KTtcbiAgfVxuICBzZXRBY3RpdmVDYXRlZ29yaWVzKGNhdGVnb3JpZXNUb01ha2VBY3RpdmU6IEFycmF5PEVtb2ppQ2F0ZWdvcnk+KSB7XG4gICAgaWYgKHRoaXMuc2hvd1NpbmdsZUNhdGVnb3J5KSB7XG4gICAgICB0aGlzLmFjdGl2ZUNhdGVnb3JpZXMgPSBjYXRlZ29yaWVzVG9NYWtlQWN0aXZlLmZpbHRlcihcbiAgICAgICAgeCA9PiAoeC5uYW1lID09PSB0aGlzLnNlbGVjdGVkIHx8IHggPT09IHRoaXMuU0VBUkNIX0NBVEVHT1JZKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hY3RpdmVDYXRlZ29yaWVzID0gY2F0ZWdvcmllc1RvTWFrZUFjdGl2ZTtcbiAgICB9XG4gIH1cbiAgdXBkYXRlQ2F0ZWdvcmllc1NpemUoKSB7XG4gICAgdGhpcy5jYXRlZ29yeVJlZnMuZm9yRWFjaChjb21wb25lbnQgPT4gY29tcG9uZW50Lm1lbW9pemVTaXplKCkpO1xuXG4gICAgaWYgKHRoaXMuc2Nyb2xsUmVmKSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLnNjcm9sbFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgdGhpcy5zY3JvbGxIZWlnaHQgPSB0YXJnZXQuc2Nyb2xsSGVpZ2h0O1xuICAgICAgdGhpcy5jbGllbnRIZWlnaHQgPSB0YXJnZXQuY2xpZW50SGVpZ2h0O1xuICAgIH1cbiAgfVxuICBoYW5kbGVBbmNob3JDbGljaygkZXZlbnQ6IHsgY2F0ZWdvcnk6IEVtb2ppQ2F0ZWdvcnk7IGluZGV4OiBudW1iZXIgfSkge1xuICAgIHRoaXMudXBkYXRlQ2F0ZWdvcmllc1NpemUoKTtcbiAgICB0aGlzLnNlbGVjdGVkID0gJGV2ZW50LmNhdGVnb3J5Lm5hbWU7XG4gICAgdGhpcy5zZXRBY3RpdmVDYXRlZ29yaWVzKHRoaXMuY2F0ZWdvcmllcyk7XG5cbiAgICBpZiAodGhpcy5TRUFSQ0hfQ0FURUdPUlkuZW1vamlzKSB7XG4gICAgICB0aGlzLmhhbmRsZVNlYXJjaChudWxsKTtcbiAgICAgIHRoaXMuc2VhcmNoUmVmLmNsZWFyKCk7XG4gICAgICB0aGlzLmhhbmRsZUFuY2hvckNsaWNrKCRldmVudCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5jYXRlZ29yeVJlZnMuZmluZChuID0+IG4uaWQgPT09ICRldmVudC5jYXRlZ29yeS5pZCk7XG4gICAgaWYgKGNvbXBvbmVudCkge1xuICAgICAgbGV0IHsgdG9wIH0gPSBjb21wb25lbnQ7XG5cbiAgICAgIGlmICgkZXZlbnQuY2F0ZWdvcnkuZmlyc3QpIHtcbiAgICAgICAgdG9wID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvcCArPSAxO1xuICAgICAgfVxuICAgICAgdGhpcy5zY3JvbGxSZWYubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSB0b3A7XG4gICAgfVxuICAgIHRoaXMuc2VsZWN0ZWQgPSAkZXZlbnQuY2F0ZWdvcnkubmFtZTtcbiAgICB0aGlzLm5leHRTY3JvbGwgPSAkZXZlbnQuY2F0ZWdvcnkubmFtZTtcbiAgfVxuICBjYXRlZ29yeVRyYWNrKGluZGV4OiBudW1iZXIsIGl0ZW06IGFueSkge1xuICAgIHJldHVybiBpdGVtLmlkO1xuICB9XG4gIGhhbmRsZVNjcm9sbCgpIHtcbiAgICBpZiAodGhpcy5uZXh0U2Nyb2xsKSB7XG4gICAgICB0aGlzLnNlbGVjdGVkID0gdGhpcy5uZXh0U2Nyb2xsO1xuICAgICAgdGhpcy5uZXh0U2Nyb2xsID0gdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuc2Nyb2xsUmVmKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnNob3dTaW5nbGVDYXRlZ29yeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBhY3RpdmVDYXRlZ29yeSA9IG51bGw7XG4gICAgaWYgKHRoaXMuU0VBUkNIX0NBVEVHT1JZLmVtb2ppcykge1xuICAgICAgYWN0aXZlQ2F0ZWdvcnkgPSB0aGlzLlNFQVJDSF9DQVRFR09SWTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5zY3JvbGxSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgIC8vIGNoZWNrIHNjcm9sbCBpcyBub3QgYXQgYm90dG9tXG4gICAgICBpZiAodGFyZ2V0LnNjcm9sbFRvcCA9PT0gMCkge1xuICAgICAgICAvLyBoaXQgdGhlIFRPUFxuICAgICAgICBhY3RpdmVDYXRlZ29yeSA9IHRoaXMuY2F0ZWdvcmllcy5maW5kKG4gPT4gbi5maXJzdCA9PT0gdHJ1ZSk7XG4gICAgICB9IGVsc2UgaWYgKHRhcmdldC5zY3JvbGxIZWlnaHQgLSB0YXJnZXQuc2Nyb2xsVG9wID09PSB0aGlzLmNsaWVudEhlaWdodCkge1xuICAgICAgICAvLyBzY3JvbGxlZCB0byBib3R0b20gYWN0aXZhdGUgbGFzdCBjYXRlZ29yeVxuICAgICAgICBhY3RpdmVDYXRlZ29yeSA9IHRoaXMuY2F0ZWdvcmllc1t0aGlzLmNhdGVnb3JpZXMubGVuZ3RoIC0gMV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBzY3JvbGxpbmdcbiAgICAgICAgZm9yIChjb25zdCBjYXRlZ29yeSBvZiB0aGlzLmNhdGVnb3JpZXMpIHtcbiAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLmNhdGVnb3J5UmVmcy5maW5kKG4gPT4gbi5pZCA9PT0gY2F0ZWdvcnkuaWQpO1xuICAgICAgICAgIGNvbnN0IGFjdGl2ZSA9IGNvbXBvbmVudCEuaGFuZGxlU2Nyb2xsKHRhcmdldC5zY3JvbGxUb3ApO1xuICAgICAgICAgIGlmIChhY3RpdmUpIHtcbiAgICAgICAgICAgIGFjdGl2ZUNhdGVnb3J5ID0gY2F0ZWdvcnk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2Nyb2xsVG9wID0gdGFyZ2V0LnNjcm9sbFRvcDtcbiAgICB9XG4gICAgaWYgKGFjdGl2ZUNhdGVnb3J5KSB7XG4gICAgICB0aGlzLnNlbGVjdGVkID0gYWN0aXZlQ2F0ZWdvcnkubmFtZTtcbiAgICB9XG4gIH1cbiAgaGFuZGxlU2VhcmNoKCRlbW9qaXM6IGFueVtdIHwgbnVsbCkge1xuICAgIHRoaXMuU0VBUkNIX0NBVEVHT1JZLmVtb2ppcyA9ICRlbW9qaXM7XG4gICAgZm9yIChjb25zdCBjb21wb25lbnQgb2YgdGhpcy5jYXRlZ29yeVJlZnMudG9BcnJheSgpKSB7XG4gICAgICBpZiAoY29tcG9uZW50Lm5hbWUgPT09ICdTZWFyY2gnKSB7XG4gICAgICAgIGNvbXBvbmVudC5lbW9qaXMgPSAkZW1vamlzO1xuICAgICAgICBjb21wb25lbnQudXBkYXRlRGlzcGxheSgkZW1vamlzID8gJ2Jsb2NrJyA6ICdub25lJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21wb25lbnQudXBkYXRlRGlzcGxheSgkZW1vamlzID8gJ25vbmUnIDogJ2Jsb2NrJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zY3JvbGxSZWYubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSAwO1xuICAgIHRoaXMuaGFuZGxlU2Nyb2xsKCk7XG4gIH1cblxuICBoYW5kbGVFbnRlcktleSgkZXZlbnQ6IEV2ZW50LCBlbW9qaT86IEVtb2ppRGF0YSkge1xuICAgIGlmICghZW1vamkpIHtcbiAgICAgIGlmICh0aGlzLlNFQVJDSF9DQVRFR09SWS5lbW9qaXMgIT09IG51bGwgJiYgdGhpcy5TRUFSQ0hfQ0FURUdPUlkuZW1vamlzLmxlbmd0aCkge1xuICAgICAgICBlbW9qaSA9IHRoaXMuU0VBUkNIX0NBVEVHT1JZLmVtb2ppc1swXTtcbiAgICAgICAgaWYgKGVtb2ppKSB7XG4gICAgICAgICAgdGhpcy5lbW9qaVNlbGVjdC5lbWl0KHsgJGV2ZW50LCBlbW9qaSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaGlkZVJlY2VudCAmJiAhdGhpcy5yZWNlbnQgJiYgZW1vamkpIHtcbiAgICAgIHRoaXMuZnJlcXVlbnRseS5hZGQoZW1vamksIHRoaXMuaXNMb2NhbFN0b3JhZ2VBY2Nlc3NpYmxlLCB0aGlzLnN0b3JhZ2VPYmplY3QpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMuY2F0ZWdvcnlSZWZzLnRvQXJyYXkoKVsxXTtcbiAgICBpZiAoY29tcG9uZW50ICYmIHRoaXMuZW5hYmxlRnJlcXVlbnRFbW9qaVNvcnQpIHtcbiAgICAgIGNvbXBvbmVudC5nZXRFbW9qaXMoKTtcbiAgICAgIGNvbXBvbmVudC5yZWYubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuICB9XG4gIGhhbmRsZUVtb2ppT3ZlcigkZXZlbnQ6IEVtb2ppRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuc2hvd1ByZXZpZXcgfHwgIXRoaXMucHJldmlld1JlZikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGVtb2ppRGF0YSA9IHRoaXMuQ1VTVE9NX0NBVEVHT1JZLmVtb2ppcyEuZmluZChcbiAgICAgIChjdXN0b21FbW9qaTogYW55KSA9PiBjdXN0b21FbW9qaS5pZCA9PT0gJGV2ZW50LmVtb2ppLmlkLFxuICAgICk7XG4gICAgaWYgKGVtb2ppRGF0YSkge1xuICAgICAgJGV2ZW50LmVtb2ppID0geyAuLi5lbW9qaURhdGEgfTtcbiAgICB9XG5cbiAgICB0aGlzLnByZXZpZXdFbW9qaSA9ICRldmVudC5lbW9qaTtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5sZWF2ZVRpbWVvdXQpO1xuICB9XG4gIGhhbmRsZUVtb2ppTGVhdmUoKSB7XG4gICAgaWYgKCF0aGlzLnNob3dQcmV2aWV3IHx8ICF0aGlzLnByZXZpZXdSZWYpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmxlYXZlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5wcmV2aWV3RW1vamkgPSBudWxsO1xuICAgICAgdGhpcy5wcmV2aWV3UmVmLnJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgICB9LCAxNik7XG4gIH1cbiAgaGFuZGxlRW1vamlDbGljaygkZXZlbnQ6IEVtb2ppRXZlbnQpIHtcbiAgICB0aGlzLmVtb2ppQ2xpY2suZW1pdCgkZXZlbnQpO1xuICAgIHRoaXMuZW1vamlTZWxlY3QuZW1pdCgkZXZlbnQpO1xuICAgIHRoaXMuaGFuZGxlRW50ZXJLZXkoJGV2ZW50LiRldmVudCwgJGV2ZW50LmVtb2ppKTtcbiAgfVxuICBoYW5kbGVTa2luQ2hhbmdlKHNraW46IEVtb2ppWydza2luJ10pIHtcbiAgICB0aGlzLnNraW4gPSBza2luO1xuICAgIGlmICh0aGlzLmlzTG9jYWxTdG9yYWdlQWNjZXNzaWJsZSkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oYCR7dGhpcy5OQU1FU1BBQ0V9LnNraW5gLCBTdHJpbmcoc2tpbikpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0b3JhZ2VPYmplY3Quc2V0SXRlbShgJHt0aGlzLk5BTUVTUEFDRX0uc2tpbmAsIFN0cmluZyhza2luKSk7XG4gICAgfVxuICAgIHRoaXMuc2tpbkNoYW5nZS5lbWl0KHNraW4pO1xuICB9XG4gIGdldFdpZHRoKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuc3R5bGUgJiYgdGhpcy5zdHlsZS53aWR0aCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3R5bGUud2lkdGg7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnBlckxpbmUgKiAodGhpcy5lbW9qaVNpemUgKyAxMikgKyAxMiArIDIgKyB0aGlzLm1lYXN1cmVTY3JvbGxiYXIgKyAncHgnO1xuICB9XG59XG4iXX0=