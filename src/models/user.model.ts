import { File } from './file.model';

export interface User {
  user_id: number,
  email: string,
  first_name: string,
  last_name: string,
  bio: string,
  profile_image_file_id: File | null,
  share_applied: boolean,
  share_interviews: boolean,
  share_offers: boolean,
  share_opportunities: boolean,
  update_datetime: string
}
