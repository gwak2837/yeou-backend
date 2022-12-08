import { Storage } from '@google-cloud/storage'

import { GOOGLE_CLOUD_STORAGE_BUCKET_NAME } from './constants'

export const bucket = new Storage().bucket(GOOGLE_CLOUD_STORAGE_BUCKET_NAME)
