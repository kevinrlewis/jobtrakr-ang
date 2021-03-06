import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

import { Job } from './../models/job.model';
import { User } from './../models/user.model';

import * as AWS from 'aws-sdk';
var cred = require('./../../../aws_cred.json');
const API_URL = environment.apiUrl;
const defaultProfileImageKey = "default_profile_image.png"

@Injectable({
  providedIn: 'root'
})
export class ManageService {

  filesArray: string[];

  constructor(
    private http: HttpClient
  ) { }


  /*
    function to call the api and save a file
    and also add the file to the database
  */
  saveFile(event, type:number) {
    // reset filesArray
    this.filesArray = [];


    // retrieve files being uploaded
    var tempFilesArray = event.target.files;

    // iterate the files
    for(var i = 0; i < tempFilesArray.length; i++) {
      // initialize form data to be sent
      let formData: FormData = new FormData();

      // store one file
      var file = tempFilesArray[i];

      // console.log("FILE:", file);

      // append form data
      formData.append('files', file);
      formData.append('type', type.toString());

      // post to the api endpoint
      this.http.post<UploadResponse>(
        environment.apiUrl + '/api/upload',
        formData
      )
        .subscribe(data => {
          // console.log("UPLOAD DATA:", data);

          // save the file to be attached to an opportunity
          this.filesArray.push(data.file);
        });
    }

    // return successful file names
    return this.filesArray;
  }

  /*
    function to call api to upload a profile image and attach it to a user
  */
  saveProfileImage(event, user_id:number) {

    // set form data for the post request
    let formData: FormData = new FormData();

    // store file
    var file = event.target.files[0];

    // console.log("FILE:", file);

    // append form data
    formData.append('profile_image', file);
    formData.append('user_id', user_id.toString());

    // post to the api endpoint and return an observable
    return this.http.post<UploadResponse>(
      environment.apiUrl + '/api/upload-profile-image',
      formData
    );
  }

  /*

  */
  addJob(body:string) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    // call api to post a job
    return this.http.post<AddJobResponse>(
      API_URL + '/api/job',
      body,
      httpOptions
    );
  }

  /*
    Get all jobs attached to a user
  */
  getJobs(user_id) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<GetJobsResponse>(
      API_URL + '/api/job/id/' + user_id,
      httpOptions
    );
  }

  /*
    Given a job id and job type id, update a job in the database
  */
  updateJobType(user_id: number, jobs_id: number, job_type_id: number) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<MessageResponse>(
      API_URL + '/api/' + user_id + '/job/' + jobs_id + '/update/' + job_type_id,
      httpOptions
    )
  }

  /*
    construct database array for the file names
  */
  formatFileNamePayload(file_arr:string[]) {
    var temp = null;
    if(file_arr !== undefined) {
      temp = '{';
      // iterate if there are multiple files
      for(var i = 0; i < file_arr.length; i++) {
        temp += file_arr[i] + ','
      }
      // don't include the trailing comma
      temp = temp.substring(0, temp.length - 1) + '}';
    }
    return temp;
  }

  /*
    check if string is formatted correctly as a url
  */
  isValidUrl(link) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locater

    if(!pattern.test(link)) {
      return false;
    } else {
      return true;
    }
  }

  /*
    get a signed url from aws for a specific key in S3
  */
  getAttachment(key, name):any {
    // initialize s3 with credentials
    var s3 = new AWS.S3(cred);

    key = (key === null || key === undefined) ? defaultProfileImageKey : key;

    var params = {
      Bucket: environment.s3FileBucket,
      Expires: 60*60,
      Key: key,
      ResponseContentDisposition: 'attachment; filename=' + name
    };

    // call the s3 method to get the signed url
    var url = s3.getSignedUrl('getObject', params);
    return url;
  }


  /*
    function to delete a file by calling the api
  */
  deleteFile(user_id, jobs_id, file_name) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<MessageResponse>(
      API_URL + '/api/' + user_id + '/delete/file',
      {
        'file_name': file_name,
        'jobs_id': jobs_id
      },
      httpOptions
    )
  }

  /*
    function to update a job by calling the api
  */
  updateJob(user_id, jobs_id, form_values) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    // call api
    return this.http.post<UpdateJobResponse>(
      API_URL + '/api/' + user_id + '/job/update',
      {
        'jobs_id': jobs_id,
        'form_values': form_values
      },
      httpOptions
    );
  }

  /*
    function to delete a job by calling the api
    user_id: int
    jobs_id: int
  */
  deleteJob(user_id:number, jobs_id:number) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    // call api
    return this.http.post<MessageResponse>(
      API_URL + '/api/' + user_id + '/delete/job',
      {
        'jobs_id': jobs_id
      },
      httpOptions
    );
  }

  /*
    function to delete multiple jobs by calling the api
    user_id: int
    jobs_ids: array of integers (jobs_ids)
  */
  deleteJobs(user_id:number, jobs_ids:number) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    // call api
    return this.http.post<UpdateJobResponse>(
      API_URL + '/api/' + user_id + '/delete/jobs',
      {
        'jobs_ids': jobs_ids
      },
      httpOptions
    );
  }

  /*
    function to call the api to get user information
    user_id: int
  */
  getUser(user_id:number) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<GetUserResponse>(
      API_URL + '/api/user/id/' + user_id,
      httpOptions
    );
  }

  /*
    function to call api to update sharing preferences of a user
  */
  updateUserSharing(user_id:number, form_values) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<UpdateUserSharingResponse>(
      API_URL + '/api/' + user_id + '/sharing/update',
      {
        'form_values': form_values
      },
      httpOptions
    );
  }

  /*
    function to call api to update user information
  */
  updateUserProfile(user_id:number, form_values) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<UpdateUserProfileResponse>(
      API_URL + '/api/' + user_id + '/profile/update',
      {
        'form_values': form_values
      },
      httpOptions
    );
  }

  /*
    calls api to retrieve an amount of users
  */
  getUsers(amount:number) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<GetUsersResponse>(
      API_URL + '/api/users',
      {
        'amount': amount
      },
      httpOptions
    );
  }

  /*
    calls api to delete a user
  */
  deleteUser(user_id:number) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<MessageResponse>(
      API_URL + '/api/delete/' + user_id,
      httpOptions
    );
  }

}

export interface MessageResponse {
  message: string
}

// interface to get an expected response from the api
// when we call the upload endpoint
export interface UploadResponse {
  message: string,
  file: string
}

// interface to get an expected response from the api
// when we call the add job endpoint
export interface AddJobResponse {
  message: string,
  data: Job
}

// interface to get an expected response from the api
// when we call the api to get all jobs interviewing
export interface GetJobsResponse {
  message: string,
  data: Job[]
}

// interface to get an expected response from the api
// when we call the update job endpoint
export interface UpdateJobResponse {
  message: string,
  data: Job
}


interface GetUserResponse {
  message: string,
  data: User
}

interface GetUsersResponse {
  message: string,
  data: User[]
}

interface UpdateUserSharingResponse {
  message: string,
  data: {
    update_user_sharing: User
  }
}

interface UpdateUserProfileResponse {
  message: string,
  data: {
    update_user_profile: User
  }
}
