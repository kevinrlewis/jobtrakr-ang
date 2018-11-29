import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ManageService {

  filesArray: string[];

  constructor(private http: HttpClient) { }


  // function to call the api and save a file
  // and also add the file to the database
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

  addJob(company_name:string, job_title:string, link:string, notes:string, type:string, attachments:string, user_id:number) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    // call api to post a job
    return this.http.post<AddJobResponse>(
      '/api/job',
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
    // .subscribe(data => {
    //   console.log(data);
    //   // close add form
    // }, error => {
    //   console.log(error);
    //   // display error
    // });
  }

  getJobs(job_type, job_type_name, user_id) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<GetJobsResponse>(
      '/api/job/' + job_type_name + '/id/' + user_id,
      httpOptions
    );
  }

  formatFileNamePayload(file_arr:string[]) {
    var temp = null;
    if(file_arr !== undefined) {
      temp = '{';
      // iterate if there are multiple files
      for(var i = 0; i < file_arr.length; i++) {
        temp += '"' + file_arr[i] + '",'
      }
      // don't include the trailing comma
      temp = temp.substring(0, temp.length - 1) + '}';
    }
    return temp;
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
  message: string
}

// interface to get an expected response from the api
// when we call the api to get all jobs interviewing
export interface GetJobsResponse {
  message: string,
  data: {
    get_jobs_by_user_id_and_job_type_id: [
      {
        jobs_id: number,
        job_title: string,
        company_name: string,
        link: string,
        notes: string,
        attachments: string[],
        active: boolean,
        job_type_id: number,
        user_id: number,
        create_datetime: string,
        update_datetime: string
      }
    ]
  }
}
