import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { from, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import * as AWS from 'aws-sdk';
const cred = require('./../../aws_cred.json');

@Injectable({
  providedIn: 'root'
})
export class ManageService {

  filesArray: string[];

  constructor(private http: HttpClient) { }


  /*
    function to call the api and save a file
    and also add the file to the database
  */
  saveFile(event, type:number) {
    // reset filesArray
    this.filesArray = [];

    // set content type
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data'
      }),
    };

    // retrieve files being uploaded
    var tempFilesArray = event.target.files;

    // iterate the files
    for(var i = 0; i < tempFilesArray.length; i++) {
      // initialize form data to be sent
      let formData: FormData = new FormData();

      // store one file
      var file = tempFilesArray[i];

      console.log("FILE:", file);

      // append form data
      formData.append('files', file);
      formData.append('type', type.toString())

      // post to the api endpoint
      this.http.post<UploadResponse>(
        'api/upload',
        formData
      )
        .subscribe(data => {
          console.log("UPLOAD DATA:", data);

          // save the file to be attached to an opportunity
          this.filesArray.push(data.file);
        });
    }

    // return successful file names
    return this.filesArray;
  }

  /*

  */
  addJob(company_name:string, job_title:string, link:string, notes:string, type:string, attachments:string, user_id:number) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    // call api to post a job
    return this.http.post<AddJobResponse>(
      'http://localhost:3000/api/job',
      {
        'company_name': company_name,
        'job_title': job_title,
        'link': link,
        'notes': notes,
        'type': type,
        'attachments': attachments,
        'user_id': user_id
      },
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
      'http://localhost:3000/api/job/id/' + user_id,
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

    return this.http.post<UpdateJobTypeResponse>(
      '/api/' + user_id + '/job/' + jobs_id + '/update/' + job_type_id,
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
  getAttachment(key):any {
    // console.log('getAttachment:', key);

    // initialize s3 with credentials
    var s3 = new AWS.S3(cred);

    var params = {
      Bucket: 'jobtrak',
      Expires: 60*60,
      Key: key
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

    return this.http.post<DeleteFileResponse>(
      '/api/' + user_id + '/delete/file',
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
      '/api/' + user_id + '/job/update',
      {
        'jobs_id': jobs_id,
        'form_values': form_values
      },
      httpOptions
    );
  }

  /*
    function to delete a job by calling the api
  */
  deleteJob(user_id, jobs_id) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    // call api
    return this.http.post<UpdateJobResponse>(
      '/api/' + user_id + '/delete/job',
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
  deleteJobs(user_id, jobs_ids) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    // call api
    return this.http.post<UpdateJobResponse>(
      '/api/' + user_id + '/delete/jobs',
      {
        'jobs_ids': jobs_ids
      },
      httpOptions
    );
  }
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
  data: {
    insert_job: {
      jobs_id: number,
      job_title: string,
      company_name: string,
      link: string,
      notes: string,
      attachments: string[],
      user_id: number,
      create_datetime: string,
      update_datetime: string,
      job_type_id: number
    }
  }
}

// interface to get an expected response from the api
// when we call the api to get all jobs interviewing
export interface GetJobsResponse {
  message: string,
  data: {
    get_jobs_by_user_id: Job[]
  }
}

export interface UpdateJobTypeResponse {
  message: string
}

export interface DeleteFileResponse {
  message: string
}

// interface for a job object
interface Job {
  jobs_id: number,
  job_title: string,
  company_name: string,
  link: string,
  notes: string,
  attachments: any,
  user_id: number,
  create_datetime: string,
  update_datetime: string,
  job_type_id: number,
  job_type_name: string
}

// interface to get an expected response from the api
// when we call the update job endpoint
export interface UpdateJobResponse {
  message: string,
  data: {
    update_job: {
      jobs_id: number,
      job_title: string,
      company_name: string,
      link: string,
      notes: string,
      attachments: string[],
      user_id: number,
      create_datetime: string,
      update_datetime: string,
      job_type_id: number
    }
  }
}
