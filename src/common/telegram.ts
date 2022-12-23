import { Telegram } from 'telegraf'

import { TELEGRAM_BOT_TOKEN } from './constants'

export const telegramBot = new Telegram(TELEGRAM_BOT_TOKEN)
