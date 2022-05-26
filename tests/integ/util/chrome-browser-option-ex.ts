import {ChromeBrowserOption} from "@taui/fa-common-lib/lib/utilities/driver/chrome-browser-option";
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';

export class ChromeBrowserOptionEx extends ChromeBrowserOption{
  constructor(optionValues) {
    super(optionValues);
    (this.getBrowserOptions() as ChromeOptions).addArguments('----disable-web-security');
  }
}