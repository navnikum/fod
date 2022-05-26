import {ojInputText, OjInputText} from '@oracle/oraclejet-webdriver/elements';
import {Config} from '../util/Config';
import {By, WebDriver} from 'selenium-webdriver';
import { oJSpectraFoldoutLayout, OJSpectraFoldoutLayout } from '@spectra/oj-spectra-webdriver/oj-sp-foldout-layout';
import { oJSpectraItemOverview, OJSpectraItemOverview } from '@spectra/oj-spectra-webdriver/oj-sp-item-overview';
import { oJSpectraFoldoutPanel, OJSpectraFoldoutPanel } from '@spectra/oj-spectra-webdriver/oj-sp-foldout-panel'
import { oJSpectraSummarizingCollection , OJSpectraSummarizingCollection} from '@spectra/oj-spectra-webdriver/oj-sp-summarizing-collection'
import {BasePage} from '@taui/fa-common-lib/lib/page/base-page';
import {PageType} from '@taui/fa-common-lib/lib/page/page-type';
import {ScreenShotUtil} from '@taui/fa-common-lib/lib/utilities/screen-shot/screen-shot-util';
 
const LOCATORS: any = {
  INVENTORY_PRODUCT_DETAIL_FOLDER_LAYOUT: By.id(Config.INVENTORY_PRODUCT_DETAIL_FOLDER_LAYOUT),
  INVENTORY_PRODUCT_DETAIL_OVERVIEW_1: By.id(Config.INVENTORY_PRODUCT_DETAIL_OVERVIEW_1),
  INVENTORY_LIST_ID: By.id(Config.INVENTORY_LIST_ID),
  SUMMARY_COLLECTION: By.id(Config.SUMMARY_COLLECTION),
};
 
export class ProductDetailPage extends BasePage{
 
  constructor(driver: WebDriver) {
    super(driver, PageType.JET);
    this.driver = driver;
  }
 
  public async getPageTitle(isDIT?: boolean): Promise<string> {
    await this.getFolderLayoutCCA(); // Wait until the foldout layout is found: this will wait until the page (context) is ready and the title is initialized
    return this.driver.getTitle();
  }
 
  public async getProductDetailPanelTitle(panel: string) {
    const supplierPanel: OJSpectraFoldoutPanel = await oJSpectraFoldoutPanel(this.driver, By.id(panel));
    return supplierPanel.getPanelTitle();
  }
 
  public async getProductDetailPanelData(inputID: string) {
    const inputText: OjInputText = await ojInputText(this.driver, By.id(inputID));
    return inputText.getValue();
  }
 
  public async getSummaryViewAll(desc?: string) {
    const viewAll: OJSpectraSummarizingCollection = await oJSpectraSummarizingCollection(this.driver, LOCATORS.SUMMARY_COLLECTION);
    if (!!desc) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
    return viewAll.getOverflowActionLabel();
  }
 
  public async summaryViewAllClick(desc?: string) {
    const folderLayout: OJSpectraFoldoutLayout = await this.getFolderLayoutCCA();
    await folderLayout.scrollPanelToView('order-list-panel');
    const viewAll: OJSpectraSummarizingCollection = await oJSpectraSummarizingCollection(this.driver, LOCATORS.SUMMARY_COLLECTION);
    await viewAll.triggerSecondaryAction();
    if (!!desc ) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
  }
 
  private async getFolderLayoutCCA(): Promise<OJSpectraFoldoutLayout> {
    return oJSpectraFoldoutLayout(this.driver, LOCATORS.INVENTORY_PRODUCT_DETAIL_FOLDER_LAYOUT)
  }
 
  private async gettemOverviewPageCCA(): Promise<OJSpectraItemOverview> {
    return oJSpectraItemOverview(this.driver, LOCATORS.INVENTORY_PRODUCT_DETAIL_OVERVIEW_1)
  }
}