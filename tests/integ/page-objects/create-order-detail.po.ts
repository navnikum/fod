import { ojButton, ojDialog, OjButton, OjDialog, OjSelectSingle, ojSelectSingle, OjInputText, ojInputText, OjTable, ojTable, ojInputNumber, OjInputNumber, ojTextArea, OjTextArea, ojButtonsetOne } from '@oracle/oraclejet-webdriver/elements';
import {By, WebDriver} from 'selenium-webdriver';
import {Config} from '../util/Config';
import { oJSpectraSmartFilterSearch, OJSpectraSmartFilterSearch } from '@spectra/oj-spectra-webdriver/oj-sp-smart-filter-search/index';
import { oJSpectraSimpleCreateEdit, OJSpectraSimpleCreateEdit } from '@spectra/oj-spectra-webdriver/oj-sp-simple-create-edit/index';
import {BasePage} from '@taui/fa-common-lib/lib/page/base-page';
import {PageType} from '@taui/fa-common-lib/lib/page/page-type';
import {BrowserUtil} from '@taui/fa-common-lib/lib/utilities/browser/browser-util';
import {ScreenShotUtil} from '@taui/fa-common-lib/lib/utilities/screen-shot/screen-shot-util';

const LOCATORS: any = {
  ATTACHMENTS_ID: By.id(Config.ATTACHMENTS_ID),
  ADDRESS_CITY_ID: By.id(Config.SHIPPING_ADDRESS_CITY_ID),
  ADDRESS_COUNTRY_ID: By.id(Config.SHIPPING_ADDRESS_COUNTRY_ID),
  ADDRESS_LINE1_ID: By.id(Config.SHIPPING_ADDRESS_LINE1_ID),
  ADDRESS_LINE2_ID: By.id(Config.SHIPPING_ADDRESS_LINE2_ID),
  ADDRESS_STATE_ID: By.id(Config.SHIPPING_ADDRESS_STATE_ID),
  ADDRESS_ZIP_ID: By.id(Config.SHIPPING_ADDRESS_ZIP_ID),
  ADD_LINE_ID: By.id(Config.ADD_LINE_BUTTON_ID),
  ORDER_COMMENTS_ID: By.id(Config.ORDER_COMMENTS_ID),
  ORDER_CUSTOMER_ID: By.id(Config.ORDER_CUSTOMER_ID(true)),
  ORDER_TABLE_ID: By.id(Config.ORDER_TABLE_ID),
  SUBMIT_DIALOG_ID: By.id(Config.SUBMIT_DIALOG_ID + Config._SUBMIT_CONFIRMATION_DIALOG_ID),
  SUBMIT_YESBUTTON_ID: By.id(Config.SUBMIT_DIALOG_ID + Config._SUBMIT_CONFIRMATION_DIALOG_SUBMIT_ID),
  SCECCA_ID: By.id(Config.SCECCA_ID),
  READONLY_SMART_FILTER_ID: By.id(Config.READONLY_SMART_FILTER_ID),
  DISCARD_BUTTON_ID: By.id(Config.DIRTY_DATA_MESSAGE_DIALOG_ID + Config._DIRTY_DATA_MESSAGE_DIALOG_DISCARD_ID)
};

export class CreateOrderDetailPage extends BasePage{

  constructor(driver: WebDriver) {
    super(driver, PageType.JET);
    this.driver = driver;
  }

  public async getPageTitle(): Promise<string> {
    return this.driver.getTitle();
  }

  public async selectCustomer(customer: string, desc?: string): Promise<void> {
    const optionEl: OjSelectSingle = await ojSelectSingle (this.driver, LOCATORS.SELECT_SINGLE_CUSTOMER_ID);
    await optionEl.changeValue(Config.CUSTOMERS.get(customer));
    await optionEl.whenBusyContextReady();
    //await this.driver.wait(ojwd.pageReady());
    if (!!desc) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
  }

  public async getCustomerShippingInfo(option?: string): Promise<string> {
    let inputText: OjInputText = await ojInputText(this.driver, LOCATORS.ORDER_CUSTOMER_ID);
    switch (option) {
      case 'City':
        inputText = await ojInputText(this.driver, LOCATORS.ADDRESS_CITY_ID);
        break;
      case 'Country':
        inputText = await ojInputText(this.driver, LOCATORS.ADDRESS_COUNTRY_ID);
        break;
      case 'Line1':
        inputText = await ojInputText(this.driver, LOCATORS.ADDRESS_LINE1_ID);
        break;
      case 'Line2':
        inputText = await ojInputText(this.driver, LOCATORS.ADDRESS_LINE2_ID);
        break;
      case 'State':
        inputText = await ojInputText(this.driver, LOCATORS.ADDRESS_STATE_ID);
        break;
      case 'Zip':
        inputText = await ojInputText(this.driver, LOCATORS.ADDRESS_ZIP_ID);
        break;
      default: break;
    }
    return await inputText.getValue();
  }

  public async addLine(): Promise<void> {
    const button: OjButton = await ojButton(this.driver, LOCATORS.ADD_LINE_ID);
    await BrowserUtil.ensureVisible(this.driver, button);
    await button.doAction();
  }

  public async getCurrentLine(): Promise<object> {
    const table: OjTable = await ojTable (this.driver, LOCATORS.ORDER_TABLE_ID);
    return await table.getCurrentRow();
  }

  public async selectProduct(lineIdx: number, productId: number): Promise<void> {
    const select: OjSelectSingle = await ojSelectSingle (this.driver, By.id(`${Config.SELECT_PRODUCT_ID}${lineIdx}`));
    return select.changeValue(productId);
  }

  public async setQuantity(lineIdx: number, qty: number): Promise<void> {
    const select: OjInputNumber = await ojInputNumber (this.driver, By.id(`${Config.ORDER_QTY_ID}${lineIdx}`));
    return select.changeValue(qty);
  }

  public async saveOrderLine(lineIdx: number, desc?: string): Promise<void> {
    const button: OjButton = await ojButton (this.driver, By.id(`${Config.ORDER_LINE_SAVE_ID}${lineIdx}`));
    await BrowserUtil.ensureVisible(this.driver, button);
    await button.doAction();
    if (!!desc) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
  }

  public async clickOnCancelButton(desc?: string): Promise<void> {
    const simpleCreateEditComp: OJSpectraSimpleCreateEdit = await this.getSimpleCreateEditCCA();
    await simpleCreateEditComp.triggerCancelAction();
   // await this.driver.wait(ojwd.pageReady());
    if (!!desc ) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
  }

  public async confirmCancelWithChanges(desc?: string): Promise<void> {
    const discardButton: OjButton = await ojButton(this.driver, LOCATORS.DISCARD_BUTTON_ID);
    await discardButton.click();
  }

  public async clickOnSubmitButton(desc?: string): Promise<void> {
    const simpleCreateEditComp: OJSpectraSimpleCreateEdit = await this.getSimpleCreateEditCCA();
    await simpleCreateEditComp.triggerPrimaryAction();
   // await this.driver.wait(ojwd.pageReady());
    if (!!desc) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
  }

  public async confirmSubmit(isYes: boolean): Promise<void> {
    const dialog: OjDialog = await ojDialog(this.driver, LOCATORS.SUBMIT_DIALOG_ID);
    if (isYes) {
       await (await ojButton(dialog, LOCATORS.SUBMIT_YESBUTTON_ID)).doAction();
    } else {
      await dialog.doClose();
    }
  }

  public async editComments(commnents: string): Promise<void> {
    const textArea: OjTextArea = await ojTextArea(this.driver, LOCATORS.ORDER_COMMENTS_ID);
    await textArea.changeValue(commnents);
  }

  public async getComments(): Promise<string> {
    const textArea: OjTextArea = await ojTextArea(this.driver, LOCATORS.ORDER_COMMENTS_ID);
    return await textArea.getValue();
  }


  public async clickOnSaveButton(desc?: string): Promise<void> {
    const simpleCreateEditComp: OJSpectraSimpleCreateEdit = await this.getSimpleCreateEditCCA();
    await simpleCreateEditComp.triggerSaveAction();
    if (!!desc) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
  }

  public async getPageHeaderTitle(): Promise<string> {
    const simpleCreateEditComp: OJSpectraSimpleCreateEdit = await this.getSimpleCreateEditCCA();
    return simpleCreateEditComp.getActualPageTitle();
  }

  public async getPageSubtitle(isReadonly?: boolean): Promise<string> {
    let comp: OJSpectraSmartFilterSearch|OJSpectraSimpleCreateEdit;
    if (isReadonly) {
      comp = await this.getSmartFilterSearchCCA();
    } else {
      comp= await this.getSimpleCreateEditCCA();
    }
    return comp.getPageSubtitle();
  }

  public async isPrimaryActionDisabled(): Promise<boolean> {
    const simpleCreateEditComp: OJSpectraSimpleCreateEdit = await this.getSimpleCreateEditCCA();
    return simpleCreateEditComp.isPrimaryActionDisabled();
  }

  public async isSaveActionDisabled(): Promise<boolean> {
    const simpleCreateEditComp: OJSpectraSimpleCreateEdit = await this.getSimpleCreateEditCCA();
    return simpleCreateEditComp.isSaveActionDisabled();
  }

  public async getContextualInfo(): Promise<Array<{ label: string, value: string }>> {
    const simpleCreateEditComp: OJSpectraSimpleCreateEdit = await this.getSimpleCreateEditCCA();
    return simpleCreateEditComp.getContextualInfo();
  }

  public async goBack(): Promise<void> {
    this.driver.navigate().back();
  }

  private async getSimpleCreateEditCCA(): Promise<OJSpectraSimpleCreateEdit> {
    return oJSpectraSimpleCreateEdit(this.driver, LOCATORS.SCECCA_ID);
  }

  private async getSmartFilterSearchCCA(): Promise<OJSpectraSmartFilterSearch> {
    return oJSpectraSmartFilterSearch(this.driver, LOCATORS.READONLY_SMART_FILTER_ID);
  }
}