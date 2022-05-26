
import { ojButton, OjButton, ojWebElement, OjWebElement, ojDialog, OjDialog, ojListView, OjListView } from '@oracle/oraclejet-webdriver/elements';
import { Log } from '@spectra/automation-utils/auto-lib/Log';
import { Config } from '../util/Config';
import { ojDynamicTable, OjDynamicTable } from '@oracle/oj-dynamic-webdriver';
import { By, WebDriver, until } from 'selenium-webdriver';
import { EditOrderDetailPage } from './edit-order-detail.po';
import { oJSpectraSmartFilterSearch, OJSpectraSmartFilterSearch } from '@spectra/oj-spectra-webdriver/oj-sp-smart-filter-search';
import { oJSpectraListItemTemplate, OJSpectraListItemTemplate } from '@spectra/oj-spectra-webdriver/oj-sp-list-item-template';
import { oJSpectraSimpleCreateEdit, OJSpectraSimpleCreateEdit } from '@spectra/oj-spectra-webdriver/oj-sp-simple-create-edit';
import type { emojiValueType } from '@spectra/oj-spectra-webdriver/oj-sp-simple-create-edit/OJSpectraSimpleCreateEdit';
import { BasePage } from '@taui/fa-common-lib/lib/page/base-page';
import { PageType } from '@taui/fa-common-lib/lib/page/page-type';
import { ScreenShotUtil } from '@taui/fa-common-lib/lib/utilities/screen-shot/screen-shot-util';
import { BrowserUtil } from '@taui/fa-common-lib/lib/utilities/browser/browser-util';

const LOCATORS: any = {
  ASKORACLE_ID: By.id(Config.ASKORACLE_ID),
  DELETE_CONF_DIALOG_ID: By.id(Config.DELETE_CONF_DIALOG_ID + Config._DIRTY_DATA_DIALOG_ID),
  DELETE_BUTTON_ID: By.id(Config.DELETE_CONF_DIALOG_ID + Config._DIRTY_DATA_DIALOG_DELETE_ID),
  ORDER_SEARCH_FILTER_ID: By.id(Config.ORDER_SEARCH_FILTER_ID),
  SHELL_ID: By.id(Config.SHELL_ID),
  LIST_ID: By.id(Config.LIST_ID),
  CONVEYOR_AMOUNT: By.id(Config.CONVEYOR_AMOUNT),
  SUBMIT_DIALOG_ID: By.id(Config.SUBMIT_DIALOG_ID + Config._SUBMIT_CONFIRMATION_DIALOG_ID),
  SUBMIT_YESBUTTON_ID: By.id('oj-dialog-submit-confirmation_primaryButton'),
  FEEDBACK_DIALOG_ID: By.id(Config._FEEDBACK_DIALOG_ID),
  FEEDBACK_YES_ID: By.id(Config._FEEDBACK_YES_ID),
  SCECCA_ID: By.id(Config.SCECCA_ID)
};

export class CreateOrderMainPage extends BasePage{
  private autolog: Log;
  private basepage: BasePage;

  constructor(driver: WebDriver) {
    super(driver, PageType.JET);
    this.driver = driver;
  }

  public async isAskOracleEnabled(isDIT?: boolean): Promise<boolean> {
    if (isDIT) {
      const isAskOracleEnabled: string = await this.driver.executeScript('return window.faConfig.PROFILE.ORA_ASK_ORACLE_ENABLED;');
      return isAskOracleEnabled === 'Y' ? true : false;
    } else {
      //workaround for express server deployment case due to issue24
      return (await this.driver.findElements(LOCATORS.ASKORACLE_ID)).length > 0;
    }
}

  public async getPageTitle(isDIT?: boolean): Promise<string> {
   // await Util.waitForPageBusyContextReady(this.driver);
    //Wait for page to be ready is not enough, need ensure shell exists then be able to get the title. Potential bug?
    const isAskOracleEnabled: boolean = await this.isAskOracleEnabled(isDIT);
    if (isAskOracleEnabled) {
      await this.driver.wait(until.elementLocated(LOCATORS.ASKORACLE_ID));
    } else {
      await this.driver.wait(until.elementLocated(LOCATORS.SHELL_ID));
    }
    return this.driver.getTitle();
  }

  public async navigateToCreatePage(desc?: string): Promise<EditOrderDetailPage> {
    const sfs: OJSpectraSmartFilterSearch = await oJSpectraSmartFilterSearch(this.driver, LOCATORS.ORDER_SEARCH_FILTER_ID);
    await sfs.whenReady();
    await sfs.triggerPrimaryAction();
    if (!!desc) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
    return new EditOrderDetailPage(this.driver);
  }

  public async navigateToEditPage(rowKey: number, desc?: string): Promise<EditOrderDetailPage> {
    const table: OjDynamicTable = await ojDynamicTable(this.driver, LOCATORS.TABLE_ID);
    await table.changeCurrentRow({ 'rowKey': rowKey });
    await table.whenBusyContextReady();
    if (!!desc) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
    return new EditOrderDetailPage(this.driver);
  }

  public async getListRowData(rowIndex: number): Promise<any> {
    const list: OjListView = await ojListView(this.driver, LOCATORS.LIST_ID);
    return this.driver.executeScript('return arguments[0].getDataForVisibleItem(arguments[1]);', list, rowIndex);
  }

  public async getNumOfResults(desc?: string): Promise<string> {
    const smartFilterSearchComp: OJSpectraSmartFilterSearch = await this.getSmartFilterSearchCCA();
    if (!!desc ) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
    return smartFilterSearchComp.getTotalResults();
  }

  public async addFilter(filter: string, desc?: string): Promise<void> {
    const smartFilterSearchComp: OJSpectraSmartFilterSearch = await this.getSmartFilterSearchCCA();
    const smartFiltersWithAddedFilter = await smartFilterSearchComp.getSmartFilters();
    smartFiltersWithAddedFilter.value = [
      ...smartFiltersWithAddedFilter.value,
      {
        filter: 'keyword',
        label: filter,
        value: filter,
      }
    ];

    await smartFilterSearchComp.changeSmartFilters(smartFiltersWithAddedFilter);

    if (!!desc ) {
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

  public async triggerOrderAction(orderIndex: string, action: string, desc?: string, isNav?:boolean): Promise<void> {
    const list: OjListView = await ojListView(this.driver, LOCATORS.LIST_ID);
    const orderId: number = parseInt(orderIndex, 10);
    const item: OJSpectraListItemTemplate = await oJSpectraListItemTemplate(list, By.id(`${Config.LISTITEM_ID_PREFIX}${orderId}`));
    await item.triggerSecondaryAction(action);
    //Due to DIT perf being slower, add safe guard to ensure navigation happens before interacting with item overview page
    if (isNav) {
      await this.driver.wait(until.stalenessOf(item));
    }
    if (!!desc ) {
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

  public async getMessageText(desc?: string): Promise<string> {
    try {
      const messages: OjWebElement = await ojWebElement(this.driver, By.id(Config.MESSAGE_ID));
      const msg: OjWebElement = await messages.findElement(By.tagName('oj-message')) as OjWebElement;
      let msgText: string = '';
      if (msg) {
        const text: string = await msg.getText();
        const textArray: string[] = text.split('\n');
        msgText = `${textArray[textArray.length - 2]} ${textArray[textArray.length - 1]}`;
      }
      if (!!desc ) {
        await ScreenShotUtil.takeScreenShot(desc, this.driver);
      }
      return msgText;

    }
    catch (err) {
      console.log('Message already disappears.')
      return null;
    }
  }

  public async clickEmoSubmit(emoExp: string): Promise<void> {
    const simpleCreateEdit: OJSpectraSimpleCreateEdit = await oJSpectraSimpleCreateEdit(this.driver, LOCATORS.SCECCA_ID);
    return simpleCreateEdit.doEmojiPrimaryAction(emoExp as emojiValueType);
  }

  public async checkSubmitDialog(): Promise<boolean> {
    await this.driver.wait(until.elementLocated(By.id('oj-dialog-submit-confirmation_dialog')));
    return await this.driver
    .executeScript(`return document.querySelector('#oj-dialog-submit-confirmation_dialog').isOpen()`);
  }

  public async checkFeedbackDialog(): Promise<boolean> {
    return await this.driver
    .executeScript(`return document.querySelector('#order-simple-create-edit_h_primaryAction_emo_feedbackDialog').isOpen()`);
  }

  public async getConfirmationDialogTitle(): Promise<string> {
    const dialog: OjDialog = await ojDialog(this.driver, LOCATORS.SUBMIT_DIALOG_ID);
   return await dialog.getDialogTitle();
  }

  public async getSubmitPopUpText(): Promise<string> {
    const ojDialogComp: OjDialog = await this.getOJDialogCCA();
    let submitPopUpTxt : OjWebElement = await ojDialogComp.findElement(By.className('oj-typography-heading-sm oj-sm-margin-0-vertical oj-sm-padding-5x-top oj-md-padding-8x-top oj-sm-padding-0-bottom oj-sm-padding-4x-horizontal oj-md-padding-8x-horizontal')) as OjWebElement;
   return await submitPopUpTxt.getText();
  }

  public async confirmSubmit(isYes: boolean): Promise<void> {
    const dialog: OjDialog = await ojDialog(this.driver, LOCATORS.SUBMIT_DIALOG_ID);
    BrowserUtil.ensureVisible(this.driver,dialog);
    if (isYes) {
       await (await ojButton(dialog, LOCATORS.SUBMIT_YESBUTTON_ID)).doAction();
    } else {
      await dialog.doClose();
    }
  }

  public async clickCloseDrawer(): Promise<void> {
    const simpleCreateEdit: OJSpectraSimpleCreateEdit = await oJSpectraSimpleCreateEdit(this.driver, LOCATORS.SCECCA_ID);
    return simpleCreateEdit.submitWithoutFeedback();
  }

  public async getConveyorAmt(): Promise<string> {
    const conveyorText: OjWebElement = await ojWebElement(this.driver,LOCATORS.CONVEYOR_AMOUNT);
    await conveyorText.whenReady();
    await BrowserUtil.ensureVisible(this.driver,conveyorText)
    return await conveyorText.getText();
  }

  public async getListItemData(rowIndex: number, columIdx: number): Promise<string> {
    const list: OjListView = await ojListView(this.driver, LOCATORS.LIST_ID);
    const items: OJSpectraListItemTemplate[] = await list.findElements(By.tagName(Config.LISTITEM_TAG_NAME)) as OJSpectraListItemTemplate[];
    return (await items[rowIndex].getColumns())[columIdx].primaryText;
  }

  private async getSmartFilterSearchCCA(): Promise<OJSpectraSmartFilterSearch> {
    return oJSpectraSmartFilterSearch(this.driver, LOCATORS.ORDER_SEARCH_FILTER_ID);
  }

  private async getOJDialogCCA(): Promise<OjDialog> {
    return ojDialog(this.driver, LOCATORS.SUBMIT_DIALOG_ID);
  }

}
