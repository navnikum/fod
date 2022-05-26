import ojwd from '@oracle/oraclejet-webdriver';
import { ojListView, OjListView, ojCollapsible, OjCollapsible, ojButton, OjButton, OjWebElement } from '@oracle/oraclejet-webdriver/elements';

import {Config} from '../util/Config';
import {By, WebDriver} from 'selenium-webdriver';
import {OJSpectraHeaderGeneralOverview, oJSpectraHeaderGeneralOverview } from '@spectra/oj-spectra-webdriver/oj-sp-header-general-overview';
import {BasePage} from '@taui/fa-common-lib/lib/page/base-page';
import {PageType} from '@taui/fa-common-lib/lib/page/page-type';
import {ScreenShotUtil} from '@taui/fa-common-lib/lib/utilities/screen-shot/screen-shot-util';
import { BrowserUtil } from '@taui/fa-common-lib/lib/utilities/browser/browser-util';
 
import {
  ojSpectraImageCard,
  OjSpectraImageCard,
} from '@spectra/oj-spectra-webdriver/oj-sp-image-card';

const LOCATORS: any = {
  ASKORACLE_ID: By.id(Config.ASKORACLE_ID),
  DELETE_CONF_DIALOG_ID: By.id(Config.DELETE_CONF_DIALOG_ID + Config._DIRTY_DATA_DIALOG_ID),
  DELETE_BUTTON_ID: By.id(Config.DELETE_CONF_DIALOG_ID + Config._DIRTY_DATA_DIALOG_DELETE_ID),
  ORDER_SEARCH_FILTER_ID: By.id(Config.ORDER_SEARCH_FILTER_ID),
  SHELL_ID: By.id(Config.SHELL_ID),
  TRAINING_LIST_ID:By.id(Config.TRAINING_LIST_ID),
  PRA_DONE_BUTTON: (index: number) => By.id(Config.PRA_DONE_BUTTON_ID(index)),
  CARD: (index: number) => By.css(`#${Config.TRAINING_LIST_ID} #${Config.TRAINING_CARD_ID_PREFIX}${index}`)
};
 
export class TrainingPage extends BasePage {
 
  constructor(driver: WebDriver) {
    super(driver, PageType.JET);
    this.driver = driver;
  }
 
  public async getPageTitle(isDIT?: boolean): Promise<string> {
    await this.driver.wait(ojwd.pageReady());
    return this.driver.getTitle();
  }
  public async getTrainingListRowData(): Promise<any> {
    const list: OjListView = await ojListView(this.driver, LOCATORS.TRAINING_LIST_ID);
    return list;
  }
  public async cardData(orderIndex: string): Promise<string> {
    const list: OjListView = await ojListView(this.driver, LOCATORS.TRAINING_LIST_ID);
    await list.whenReady();

    const card: OjSpectraImageCard = await ojSpectraImageCard(this.driver, LOCATORS.CARD(orderIndex));
    return card.getPrimaryText();
  }
  public async clickOnTheCard(orderIndex: string) {
    const list: OjListView = await ojListView(this.driver, LOCATORS.TRAINING_LIST_ID);
    const card = list.findElement(By.id(`${Config.TRAINING_CARD_ID_PREFIX}${orderIndex}`))
    await card.click();
  }
  public async getHeadingTitle(): Promise<string> {
    const headerGeneralOverview: OJSpectraHeaderGeneralOverview = await this.getHeaderGeneralOverviewCCA();
    return await headerGeneralOverview.getPageTitle();
  }
  private async getHeaderGeneralOverviewCCA(): Promise<OJSpectraHeaderGeneralOverview> {
    const elm = this.driver.findElement(By.tagName('oj-sp-header-general-overview'));
    return  oJSpectraHeaderGeneralOverview(this.driver, By.id(`${await elm.getAttribute('id')}`));
  }
  public async openCollapsible(collapseID: string, desc?: string): Promise<void> {
    const expandOpt: OjCollapsible = await ojCollapsible(this.driver, By.id(collapseID));
    await expandOpt.doExpand();
    if (!!desc) {
    await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
  }
  public async clickDone(index: number): Promise<void> {
    const doneBtn: OjButton = await ojButton(this.driver, LOCATORS.PRA_DONE_BUTTON(index));
    return await doneBtn.click();
  }
  public async isEnabledCheck(index: number): Promise<boolean> {
    const doneBtn: OjButton = await ojButton(this.driver, LOCATORS.PRA_DONE_BUTTON(index));
    BrowserUtil.ensureVisible(this.driver,doneBtn);
    return await doneBtn.isEnabled();
  }
  

  public async getBadgeStatus(index: number):Promise<string> {
    const card : OjSpectraImageCard = await this.getSmartCardCCA(index);
    return  (await card.getBadge()).text;
  }
  
  private async getSmartCardCCA(index:number): Promise<OjSpectraImageCard> {
    return ojSpectraImageCard(this.driver,  By.id(`${Config.TRAINING_CARD_ID_PREFIX}${index}`));
  }
  //ToDo: Will change once the Id is available
  public async getCompletedTaskTextOnScreen():Promise<string>{
  const el:OjWebElement = (await this.driver.findElement(By.xpath("//*[@class='oj-sm-padding-2x-bottom']"))) as OjWebElement ;
  return await el.getText() ;
  }
}
 