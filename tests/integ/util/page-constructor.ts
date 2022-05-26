import {WebDriver} from 'selenium-webdriver';
 
export interface PageConstructor<PageType> {
  new (driver: WebDriver): PageType;
}
