import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmojiModule, EmojiService } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { AnchorsComponent } from './anchors.component';
import { CategoryComponent } from './category.component';
import { PickerComponent } from './picker.component';
import { PreviewComponent } from './preview.component';
import { SearchComponent } from './search.component';
import { SkinComponent } from './skins.component';
import { EmojiFrequentlyService } from './emoji-frequently.service';
export class PickerModule {
}
PickerModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, FormsModule, EmojiModule],
                exports: [
                    PickerComponent,
                    AnchorsComponent,
                    CategoryComponent,
                    SearchComponent,
                    PreviewComponent,
                    SkinComponent,
                ],
                declarations: [
                    PickerComponent,
                    AnchorsComponent,
                    CategoryComponent,
                    SearchComponent,
                    PreviewComponent,
                    SkinComponent,
                ],
                providers: [
                    EmojiService,
                    EmojiFrequentlyService
                ],
                schemas: [
                    CUSTOM_ELEMENTS_SCHEMA,
                    NO_ERRORS_SCHEMA,
                ]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlja2VyLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvcGlja2VyL3BpY2tlci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTdDLE9BQU8sRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDM0UsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDekQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbEQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUE2QnBFLE1BQU0sT0FBTyxZQUFZOzs7WUEzQnhCLFFBQVEsU0FBQztnQkFDUixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQztnQkFDakQsT0FBTyxFQUFFO29CQUNQLGVBQWU7b0JBQ2YsZ0JBQWdCO29CQUNoQixpQkFBaUI7b0JBQ2pCLGVBQWU7b0JBQ2YsZ0JBQWdCO29CQUNoQixhQUFhO2lCQUNkO2dCQUNELFlBQVksRUFBRTtvQkFDWixlQUFlO29CQUNmLGdCQUFnQjtvQkFDaEIsaUJBQWlCO29CQUNqQixlQUFlO29CQUNmLGdCQUFnQjtvQkFDaEIsYUFBYTtpQkFDZDtnQkFDRCxTQUFTLEVBQUU7b0JBQ1QsWUFBWTtvQkFDWixzQkFBc0I7aUJBQ3ZCO2dCQUNELE9BQU8sRUFBRTtvQkFDUCxzQkFBc0I7b0JBQ3RCLGdCQUFnQjtpQkFDakI7YUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBDVVNUT01fRUxFTUVOVFNfU0NIRU1BLCBOZ01vZHVsZSwgTk9fRVJST1JTX1NDSEVNQSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRm9ybXNNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IEVtb2ppTW9kdWxlLCBFbW9qaVNlcnZpY2UgfSBmcm9tICdAY3RybC9uZ3gtZW1vamktbWFydC9uZ3gtZW1vamknO1xuaW1wb3J0IHsgQW5jaG9yc0NvbXBvbmVudCB9IGZyb20gJy4vYW5jaG9ycy5jb21wb25lbnQnO1xuaW1wb3J0IHsgQ2F0ZWdvcnlDb21wb25lbnQgfSBmcm9tICcuL2NhdGVnb3J5LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQaWNrZXJDb21wb25lbnQgfSBmcm9tICcuL3BpY2tlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgUHJldmlld0NvbXBvbmVudCB9IGZyb20gJy4vcHJldmlldy5jb21wb25lbnQnO1xuaW1wb3J0IHsgU2VhcmNoQ29tcG9uZW50IH0gZnJvbSAnLi9zZWFyY2guY29tcG9uZW50JztcbmltcG9ydCB7IFNraW5Db21wb25lbnQgfSBmcm9tICcuL3NraW5zLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBFbW9qaUZyZXF1ZW50bHlTZXJ2aWNlIH0gZnJvbSAnLi9lbW9qaS1mcmVxdWVudGx5LnNlcnZpY2UnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLCBGb3Jtc01vZHVsZSwgRW1vamlNb2R1bGVdLFxuICBleHBvcnRzOiBbXG4gICAgUGlja2VyQ29tcG9uZW50LFxuICAgIEFuY2hvcnNDb21wb25lbnQsXG4gICAgQ2F0ZWdvcnlDb21wb25lbnQsXG4gICAgU2VhcmNoQ29tcG9uZW50LFxuICAgIFByZXZpZXdDb21wb25lbnQsXG4gICAgU2tpbkNvbXBvbmVudCxcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgUGlja2VyQ29tcG9uZW50LFxuICAgIEFuY2hvcnNDb21wb25lbnQsXG4gICAgQ2F0ZWdvcnlDb21wb25lbnQsXG4gICAgU2VhcmNoQ29tcG9uZW50LFxuICAgIFByZXZpZXdDb21wb25lbnQsXG4gICAgU2tpbkNvbXBvbmVudCxcbiAgXSxcbiAgcHJvdmlkZXJzOiBbXG4gICAgRW1vamlTZXJ2aWNlLFxuICAgIEVtb2ppRnJlcXVlbnRseVNlcnZpY2VcbiAgXSxcbiAgc2NoZW1hczogW1xuICAgIENVU1RPTV9FTEVNRU5UU19TQ0hFTUEsXG4gICAgTk9fRVJST1JTX1NDSEVNQSxcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBQaWNrZXJNb2R1bGUge31cbiJdfQ==