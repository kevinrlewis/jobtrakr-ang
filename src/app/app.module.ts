import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// import { HttpModule } from '@angular/http';

// icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faMountain } from '@fortawesome/free-solid-svg-icons';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { faUserTie } from '@fortawesome/free-solid-svg-icons';
import { faSmileBeam } from '@fortawesome/free-solid-svg-icons';


import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';
import { ProfileComponent } from './profile/profile.component';
import { HomeComponent } from './home/home.component';

import { AuthGuard } from './auth/auth.guard';
import { LoginGuard } from './login/login.guard';
import { AuthService } from './auth/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { JwtHelperService } from '@auth0/angular-jwt';

const appRoutes: Routes = [
  { path: '', component: HomeComponent, data: { title: 'JobTrakMe' } },
  { path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard]
  },
  { path: 'profile/:id',
    component: ProfileComponent,
    children: [
      { path: '', redirectTo: '', pathMatch: 'full'}
    ],
    canActivate: [AuthGuard]
  },
  { path: '**', component: PageNotFoundComponent }
];

library.add(faUser);
library.add(faMountain);
library.add(faLayerGroup);
library.add(faUserTie);
library.add(faSmileBeam);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PageNotFoundComponent,
    ProfileComponent,
    HomeComponent
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
    // HttpModule
  ],
  providers: [AuthService, CookieService, JwtHelperService],
  bootstrap: [AppComponent]
})
export class AppModule { }
