export interface Profile {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}

export interface StudyBlock {
  id: string
  user_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  notification_sent: boolean
  created_at: string
  updated_at: string
}

export interface EmailNotification {
  id: string
  study_block_id: string
  user_id: string
  sent_at: string
  email_type: string
}

export interface StudyBlockWithProfile extends StudyBlock {
  profiles: Profile
}
