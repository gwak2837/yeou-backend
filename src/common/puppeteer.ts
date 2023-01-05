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
            args: [
              '--disable-accelerated-2d-canvas',
              '--disable-dev-shm-usage',
              '--disable-features=IsolateOrigins,site-per-process',
              '--disable-gpu',
              '--disable-setuid-sandbox',
              '--disable-web-security',
              '--no-first-run',
              '--no-sandbox',
            ],
            executablePath: '/usr/bin/chromium-browser',
            timeout: 10_000,
          }
        : {
            timeout: 10_000,
          }
    )
  }
}

const puppeteer = new Puppeteer()

export default puppeteer
