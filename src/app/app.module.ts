import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgDragDropModule } from 'ng-drag-drop';
// import { HttpModule } from '@angular/http';
import { enableProdMode } from '@angular/core';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { HomeComponent } from './home/home.component';

import { AuthGuard } from './auth/auth.guard';
import { LoginGuard } from './login/login.guard';
import { AuthService } from './auth/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ManageComponent } from './manage/manage.component';
import { HeaderbarComponent } from './headerbar/headerbar.component';
import { JobtypeComponent } from './manage/jobtype/jobtype.component';
import { JobtypeSettingsComponent } from './manage/jobtype/jobtype-settings/jobtype-settings.component';
import { EditComponent } from './manage/jobtype/edit/edit.component';
import { ProfileComponent } from './profile/profile.component';
import { AboutComponent } from './about/about.component';
import { HeaderbarOutComponent } from './headerbar-out/headerbar-out.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent, data: { title: 'JobTrakMe' } },
  { path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard]
  },
  { path: 'about',
    component: AboutComponent,
    canActivate: [],
    data: { title: 'About | JobTrakMe' }
  },
  { path: 'settings/:id',
    component: ProfileSettingsComponent,
    // children: [
    //   { path: '', redirectTo: '', pathMatch: 'full'}
    // ],
    canActivate: [AuthGuard]
  },
  { path: 'manage/:id',
    component: ManageComponent,
    // children: [
    //   { path: '', redirectTo: '', pathMatch: 'full'}
    // ],
    canActivate: [AuthGuard]
  },
  { path: 'profile/:id',
    component: ProfileComponent,
    // children: [
    //   { path: '', redirectTo: '', pathMatch: 'full'}
    // ],
    canActivate: []
  },
  { path: '**', component: PageNotFoundComponent }
];

if(environment.production) {
  console.log("PRODUCTION");
  enableProdMode();
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PageNotFoundComponent,
    ProfileSettingsComponent,
    HomeComponent,
    ManageComponent,
    HeaderbarComponent,
    JobtypeComponent,
    JobtypeSettingsComponent,
    EditComponent,
    ProfileComponent,
    AboutComponent,
    HeaderbarOutComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    FontAwesomeModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgDragDropModule.forRoot(),
    // HttpModule
  ],
  providers: [AuthService, CookieService, JwtHelperService],
  bootstrap: [AppComponent]
})
export class AppModule { }
