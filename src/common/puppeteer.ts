/* eslint-disable no-undef */
import { Browser } from 'puppeteer'
import puppeteerExtra from 'puppeteer-extra'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

import { PROJECT_ENV } from './constants'

puppeteerExtra.use(AdblockerPlugin()).use(StealthPlugin())

class Puppeteer {
  browser: Promise<Browser>

  constructor() {
    // https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-on-gitlabci
    this.browser = puppeteerExtra.launch(
      PROJECT_ENV === 'cloud-prod' || PROJECT_ENV === 'local-docker'
        ? {
            executablePath: '/usr/bin/chromium-browser',
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-web-security',
              '--disable-features=IsolateOrigins,site-per-process',
            ],
          }
        : undefined
    )
  }
}

const puppeteer = new Puppeteer()

export default puppeteer
