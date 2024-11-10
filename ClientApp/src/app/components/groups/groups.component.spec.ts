import { TuiBlockStatus } from "@taiga-ui/layout";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupsComponent } from './groups.component';
import { IGroup } from 'src/app/core/interfaces/i-dialog-group';
import { ApiService } from 'src/app/core/services/api.service';
import { firstValueFrom, map, of } from 'rxjs';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TuiInputInline, TuiTiles } from '@taiga-ui/kit';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { TuiIcon, TuiButton } from '@taiga-ui/core';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { ChangeDetectionStrategy } from '@angular/compiler';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const MOCKLANG: string = 'english';
const MOCKGROUPS: IGroup[] = [
  {
    "Id": "_1",
    "Language": "english",
    "MainGroup": "main",
    "OriginalName": "001",
    "Name": "001",
    "ImageLink": "",
    "Files": 6,
    "TranslatedFiles": 6,
    "Order": 0,
    "editing": false
  },
  {
    "Id": "_2",
    "Language": "english",
    "MainGroup": "main",
    "OriginalName": "002",
    "Name": "002",
    "ImageLink": "",
    "Files": 8,
    "TranslatedFiles": 8,
    "Order": 0,
    "editing": false
  },
  {
    "Id": "_3",
    "Language": "english",
    "MainGroup": "main",
    "OriginalName": "003",
    "Name": "003",
    "ImageLink": "",
    "Files": 7,
    "TranslatedFiles": 7,
    "Order": 0,
    "editing": false
  }
];

describe('GroupsComponent', () => {
  let component: GroupsComponent;
  let fixture: ComponentFixture<GroupsComponent>;
  let api: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        TuiTiles,
        TuiIcon,
        TuiButton,
        TuiBlockStatus,
        TuiInputInline,
        TranslateModule.forRoot({}),
        GroupsComponent,
    ],
    providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { params: { 'mid': 'value' } } } },
        { provide: LanguageOriginService, useValue: { language$: of(MOCKLANG) } },
        { provide: ApiService, useValue: { getWithHeaders: (url: string, headers: {}) => of(MOCKGROUPS) } }
    ]
}).overrideComponent(GroupsComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    });

    fixture = TestBed.createComponent(GroupsComponent);
    component = fixture.componentInstance;

    api = Inject(ApiService);

    component.groups$ = of(MOCKGROUPS);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render groups', done => {
    let groupsRender = fixture.debugElement.queryAll(By.css(".tile")).length;

    firstValueFrom(component.groups$)
      .then(r => {
        expect(groupsRender).toEqual(r.length);
        done();
      });

  });

  it('should render empty', () => {
    component.groups$ = of([]);
    fixture.detectChanges();
    fixture.checkNoChanges();

    let emptyRender = fixture.debugElement.query(By.css(".empty-groups"));
    expect(emptyRender).toBeTruthy();
  });

  it('should edit name', async () => {
    let editButton = fixture.debugElement.query(By.directive(TuiButton));
    spyOn(component, 'toogle');
    spyOn(component, 'onEditGroupName');
    spyOn(component, 'onFocusedChange');
    expect(editButton).toBeTruthy();
    editButton.nativeElement.click();
    expect(component.toogle).toHaveBeenCalledTimes(1);
  });

});
