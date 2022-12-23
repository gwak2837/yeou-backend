import { Browser } from 'puppeteer'
import puppeteerExtra from 'puppeteer-extra'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteerExtra.use(AdblockerPlugin()).use(StealthPlugin())

class Puppeteer {
  browser: Promise<Browser>

  constructor() {
    this.browser = puppeteerExtra.launch()
  }
}

const puppeteer = new Puppeteer()

export default puppeteer
