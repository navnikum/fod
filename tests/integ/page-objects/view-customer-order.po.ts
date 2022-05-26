import {By, WebDriver} from 'selenium-webdriver';
import {Config} from '../util/Config';
import { oJSpectraItemOverviewPage, OJSpectraItemOverviewPage } from '@spectra/oj-spectra-webdriver/oj-sp-item-overview-page';
import { oJSpectraItemOverview, OJSpectraItemOverview } from '@spectra/oj-spectra-webdriver/oj-sp-item-overview/index';
import { OjListView, ojListView } from '@oracle/oraclejet-webdriver/elements/oj-list-view';
import { oJSpectraListItemTemplate, OJSpectraListItemTemplate } from '@spectra/oj-spectra-webdriver/oj-sp-list-item-template';
import { ojButton, OjButton, ojDialog, OjDialog } from '@oracle/oraclejet-webdriver/elements';
import {BasePage} from '@taui/fa-common-lib/lib/page/base-page';
import {PageType} from '@taui/fa-common-lib/lib/page/page-type';
import {ScreenShotUtil} from '@taui/fa-common-lib/lib/utilities/screen-shot/screen-shot-util';
import { oJSpectraHeaderGeneralOverview } from '@spectra/oj-spectra-webdriver/oj-sp-header-general-overview';
import { OJSpectraHeaderGeneralOverview } from '@spectra/oj-spectra-webdriver/oj-sp-header-general-overview/OJSpectraHeaderGeneralOverview';
const LOCATORS: any = {
  DELETE_CONF_DIALOG_ID: By.id(Config.DELETE_CONF_DIALOG_ID),
  DELETE_BUTTON_ID: By.id(Config.DELETE_BUTTON_ID),
  IOPAGE_ID: By.id(Config.CUSTOMER_OVERVIEWPAGE_ID),
  IOCOMP_ID: By.id(Config.CUSTOMER_OVERVIEW_ID),
  LIST_CUSTOMER_ID: By.id(Config.LIST_CUSTOMER_ID),
  HEADER_CCA :By.id(Config.ORDER_TITLE)
};
 
export class ViewCustomerOrder extends BasePage{
 
  constructor(driver: WebDriver) {
    super(driver, PageType.JET);
    this.driver = driver;
  }
 
  public async getPageTitle(): Promise<string> {
    return this.driver.getTitle();
  }
 
  public async clickOnGotoParentButton(desc?: string): Promise<void> {
    const ioPageComp: OJSpectraItemOverviewPage = await this.getItemOverviewPageCCA();
    await ioPageComp.triggerGotoParentAction();
    if (!!desc) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
     }
  }
 
  public async clickOnOverviewCollapseButton(): Promise<void> {
    const ioPageComp: OJSpectraItemOverviewPage = await this.getItemOverviewPageCCA();
    await ioPageComp.triggerOverviewCollapseAction();
  }
 
  public async clickOnPreviousButton(desc?: string): Promise<void> {
    const ioPageComp: OJSpectraItemOverviewPage = await this.getItemOverviewPageCCA();
    await ioPageComp.triggerPreviousAction();
    if (!!desc ) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
  }
 
  public async clickOnNextButton(desc?: string): Promise<void> {
    const ioPageComp: OJSpectraItemOverviewPage = await this.getItemOverviewPageCCA();
    await ioPageComp.triggerNextAction();
    if (!!desc) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
  }
 
  public async expandToFullView(io: OJSpectraItemOverview, desc?: string): Promise<boolean> {
    const isExpanded: boolean = await io.expandToFullView();
    if (!!desc ) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
    return isExpanded;
  }
 
  public async getItemTitle(): Promise<string> {
    const itemOverviewComp: OJSpectraItemOverview = await this.getItemOverviewComponent();
    return itemOverviewComp.getItemTitle();
  }
 
  public async getCustomerOrderData(rowIndex: number, columIdx: number): Promise<string> {
    const list: OjListView = await ojListView(this.driver, LOCATORS.LIST_CUSTOMER_ID);
    const items: OJSpectraListItemTemplate[] = await list.findElements(By.tagName(Config.LISTITEM_TAG_NAME)) as OJSpectraListItemTemplate[];
    return (await items[rowIndex].getColumns())[columIdx].primaryText;
  }
 
  public async getOrderNumber(id: string, columIdx: number): Promise<string> {
    const item: OJSpectraListItemTemplate = await oJSpectraListItemTemplate (this.driver, By.id(id));
    return item.getColumns[columIdx].primaryText;
  }
 
  public async triggerCustomOrderAction(itemId: string, action: string, desc?: string): Promise<void> {
    const list: OjListView = await ojListView(this.driver, LOCATORS.LIST_CUSTOMER_ID);
    const item: OJSpectraListItemTemplate = await oJSpectraListItemTemplate(list, By.id(itemId));
    await item.triggerSecondaryAction(action);
    if (!!desc) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
  }
 
  public async confirmDelete(isDelete: boolean): Promise<void> {
    const dialog: OjDialog = await ojDialog(this.driver, LOCATORS.DELETE_CONF_DIALOG_ID);
    if (isDelete) {
       const buttons: OjButton = await ojButton (dialog, LOCATORS.DELETE_BUTTON_ID);
       await buttons.doAction();
    } else {
      await dialog.doClose();
    }
  }
 
  public async getListItemId(status: string): Promise<string> {
    const list: OjListView = await ojListView(this.driver, LOCATORS.LIST_CUSTOMER_ID);
    const items: OJSpectraListItemTemplate[] = await list.findElements(By.tagName(Config.LISTITEM_TAG_NAME)) as OJSpectraListItemTemplate[];
    for (const item of items) {
      if ( ((await item.getBadge()).text).toLocaleLowerCase() === status.toLocaleLowerCase()) {
          return await item.getAttribute(`id`);
      }
    }
  }
 
  public async getItemOverviewComponent (): Promise<OJSpectraItemOverview> {
    return oJSpectraItemOverview(this.driver, LOCATORS.IOCOMP_ID);
  }
  public async getOrderTitle(): Promise<string> {
    const headerComp: OJSpectraHeaderGeneralOverview = await this.getHeaderGeneralOverviewCCA();
    await headerComp.whenReady();
    return headerComp.getPageTitle();
  }
  private async getItemOverviewPageCCA(): Promise<OJSpectraItemOverviewPage> {
    return oJSpectraItemOverviewPage(this.driver, LOCATORS.IOPAGE_ID);
  }
  private async getHeaderGeneralOverviewCCA(): Promise<OJSpectraHeaderGeneralOverview> {
    return oJSpectraHeaderGeneralOverview(this.driver, LOCATORS.HEADER_CCA);
  }
}