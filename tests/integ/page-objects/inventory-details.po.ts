import {ojListView, OjListView,OjButton,ojButton} from '@oracle/oraclejet-webdriver/elements';
import {Config} from '../util/Config';
import { By, WebDriver, until } from 'selenium-webdriver';
import { oJSpectraSmartFilterSearch, OJSpectraSmartFilterSearch } from '@spectra/oj-spectra-webdriver/oj-sp-smart-filter-search/index';
import { OJSpectraListItemTemplate } from '@spectra/oj-spectra-webdriver/oj-sp-list-item-template/index';
import { OjSpectraObjectCard } from '@spectra/oj-spectra-webdriver/oj-sp-object-card'
import {ProductDetailPage} from './product-detail.po'
import {BasePage} from '@taui/fa-common-lib/lib/page/base-page';
import {PageType} from '@taui/fa-common-lib/lib/page/page-type';
import {ScreenShotUtil} from '@taui/fa-common-lib/lib/utilities/screen-shot/screen-shot-util';
 
 
const LOCATORS: any = {
  INVENTORY_SEARCH_FILTER_ID: By.id(Config.INVENTORY_SEARCH_FILTER_ID),
  LIST_ID: By.id(Config.INVENTORY_LIST_ID),
  ADD_PRODUCT_BTN : By.id(Config.ADD_PRODUCT_BTN)
};
 
export class InventoryDetailPage extends BasePage{
 
  constructor(driver: WebDriver) {
    super(driver, PageType.JET);
    this.driver = driver;
  }
 
  public async getPageTitle(isDIT?: boolean): Promise<string> {
    return this.driver.getTitle();
  }
 
  public async getNumOfResults(): Promise<string> {
    const smartFilterSearchComp: OJSpectraSmartFilterSearch = await this.getSmartFilterSearchCCA();
    await smartFilterSearchComp.whenReady();
    await this.driver.wait(until.elementIsVisible(smartFilterSearchComp));
    return smartFilterSearchComp.getTotalResults();
  }
 
  public async addFilter(needExpand: boolean, filter: string, desc?: string): Promise<void> {
    const smartFilterSearchComp: OJSpectraSmartFilterSearch = await this.getSmartFilterSearchCCA();
    await smartFilterSearchComp.whenReady();
    await this.driver.wait(until.elementIsVisible(smartFilterSearchComp));
    if (needExpand) {
      await smartFilterSearchComp.expandSmartSearch();
    }
    await smartFilterSearchComp.addFilter(filter);
    if (!!desc) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
  }
 
  public async removeFilter(filter: string, desc?: string): Promise<void> {
    const smartFilterSearchComp: OJSpectraSmartFilterSearch = await this.getSmartFilterSearchCCA();
    await smartFilterSearchComp.deleteFilter(filter);
    if (!!desc) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
  }
 
  public async getListRowData(rowIndex: number): Promise<any> {
    const list: OjListView = await ojListView(this.driver, LOCATORS.LIST_ID);
    return this.driver.executeScript('return arguments[0].getDataForVisibleItem(arguments[1]);', list, rowIndex);
  }
 
  public async cardData(orderIndex: number) {
    const list: OjListView = await ojListView(this.driver, LOCATORS.LIST_ID);
    const cards: OjSpectraObjectCard[] = await list.findElements(By.css('oj-sp-object-card')) as OjSpectraObjectCard[];
    const card = cards[orderIndex];
    return card.getLabel();
  }
 
  public async triggerProductDetailAction(orderIndex: number, action: string, desc?: string): Promise<ProductDetailPage> {
    const list: OjListView = await ojListView(this.driver, LOCATORS.LIST_ID);
    const cards: OjSpectraObjectCard[] = await list.findElements(By.css('oj-sp-object-card')) as OjSpectraObjectCard[];
    const card = cards[orderIndex];
    await card.click();
    if (!!desc ) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
    return new ProductDetailPage(this.driver);
  }
 
  public async getListItemData(rowIndex: number, columIdx: number): Promise<string> {
    const list: OjListView = await ojListView(this.driver, LOCATORS.LIST_ID);
    const items: OJSpectraListItemTemplate[] = await list.findElements(By.tagName(Config.LISTITEM_TAG_NAME)) as OJSpectraListItemTemplate[];
    return (await items[rowIndex].getColumns())[columIdx].primaryText;
  }
 
  private async getSmartFilterSearchCCA(): Promise<OJSpectraSmartFilterSearch> {
    return oJSpectraSmartFilterSearch(this.driver, LOCATORS.INVENTORY_SEARCH_FILTER_ID);
  }
  public async clickAddProduct(): Promise<void> {
    const doneBtn: OjButton = await ojButton(this.driver, LOCATORS.ADD_PRODUCT_BTN);
    await doneBtn.click();
  }

  public async waitAddProductBtn(): Promise<void> {
    const doneBtn: OjButton = await ojButton(this.driver, LOCATORS.ADD_PRODUCT_BTN);
    await doneBtn.whenReady(),
      await this.driver.wait(until.elementIsVisible(doneBtn))
 
  }
  

}