import { Contact } from './contact.model';

export interface Job {
  jobs_id: number,
  job_title: string,
  company_name: string,
  link: string,
  notes: string,
  attachments: string[],
  user_id: number,
  create_datetime: string,
  update_datetime: string,
  job_type_id: number,
  contacts: Contact[]
}
