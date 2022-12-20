import { Telegram } from 'telegraf'
import { message } from 'telegraf/filters'

import { TELEGRAM_BOT_TOKEN } from './constants'

export const telegramBot = new Telegram(TELEGRAM_BOT_TOKEN)
