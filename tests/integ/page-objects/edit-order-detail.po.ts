import { ojButton, ojDialog, OjButton, OjDialog, OjSelectSingle, ojSelectSingle,OjTable, ojTable, ojInputNumber, OjInputNumber, ojTextArea, OjTextArea } from '@oracle/oraclejet-webdriver/elements';
import {Config} from '../util/Config';
import { By, WebDriver, until } from 'selenium-webdriver';
import { oJSpectraSmartFilterSearch, OJSpectraSmartFilterSearch } from '@spectra/oj-spectra-webdriver/oj-sp-smart-filter-search/index';
import { oJSpectraSimpleCreateEdit, OJSpectraSimpleCreateEdit } from '@spectra/oj-spectra-webdriver/oj-sp-simple-create-edit/index';
import { oJSpectraInputAddress, OJSpectraInputAddress } from '@spectra/oj-spectra-webdriver/oj-sp-input-address/index';
import { oJSpectraInputPhoneNumber, OJSpectraInputPhoneNumber } from '@spectra/oj-spectra-webdriver/oj-sp-input-phone-number/index';
import {BasePage} from '@taui/fa-common-lib/lib/page/base-page';
import {PageType} from '@taui/fa-common-lib/lib/page/page-type';
import {ScreenShotUtil} from '@taui/fa-common-lib/lib/utilities/screen-shot/screen-shot-util';
import {BrowserUtil} from '@taui/fa-common-lib/lib/utilities/browser/browser-util';

const LOCATORS: any = {
  SCECCA_ID: By.id(Config.SCECCA_ID),
  ORDER_CUSTOMER_INPUT_ID: By.id(Config.ORDER_CUSTOMER_ID(true)),
  ATTACHMENTS_ID: By.id(Config.ATTACHMENTS_ID),
  SHIPPING_ADDRESS: By.id(Config.SHIPPING_ADDRESS),
  ADDRESS_CITY_ID: By.id(Config.SHIPPING_ADDRESS_CITY_ID),
  ADDRESS_COUNTRY_ID: By.id(Config.SHIPPING_ADDRESS_COUNTRY_ID),
  ADDRESS_LINE1_ID: By.id(Config.SHIPPING_ADDRESS_LINE1_ID),
  ADDRESS_LINE2_ID: By.id(Config.SHIPPING_ADDRESS_LINE2_ID),
  ADDRESS_STATE_ID: By.id(Config.SHIPPING_ADDRESS_STATE_ID),
  ADDRESS_ZIP_ID: By.id(Config.SHIPPING_ADDRESS_ZIP_ID),
  ADD_LINE_ID: By.id(Config.ADD_LINE_BUTTON_ID),
  ORDER_COMMENTS_ID: By.id(Config.ORDER_COMMENTS_ID),
  ORDER_PHONE_ID: By.id(Config.ORDER_PHONE_ID(true)),
  ORDER_TABLE_ID: By.id(Config.ORDER_TABLE_ID),
  SUBMIT_DIALOG_ID: By.id(Config.SUBMIT_DIALOG_ID + Config._SUBMIT_CONFIRMATION_DIALOG_ID),
  SUBMIT_YESBUTTON_ID: By.id(Config.SUBMIT_DIALOG_ID + Config._SUBMIT_CONFIRMATION_DIALOG_SUBMIT_ID),
  READONLY_SMART_FILTER_ID: By.id(Config.READONLY_SMART_FILTER_ID),
  DISCARD_BUTTON_ID: By.id(Config.DIRTY_DATA_MESSAGE_DIALOG_ID + Config._DIRTY_DATA_MESSAGE_DIALOG_DISCARD_ID)
};

export class EditOrderDetailPage extends BasePage {

  constructor(driver: WebDriver) {
    super(driver, PageType.JET);
    this.driver = driver;
  }

  public async getPageTitle(): Promise<string> {
    return this.driver.getTitle();
  }

  public async getOrderId (): Promise<string> {
    const pageTitle: string = await this.getPageHeaderTitle();
    return pageTitle.substring(Config.EDIT_ORDER_PAGE_TITLE.length).trim();
  }

  public async getPageTitlePlaceholder(): Promise<string> {
    const simpleCreateEditComp: OJSpectraSimpleCreateEdit = await this.getSimpleCreateEditCCA();
    return simpleCreateEditComp.getPageTitlePlaceholder();
  }

  public async isSubmitActionDisabled(): Promise<boolean> {
    const simpleCreateEditComp: OJSpectraSimpleCreateEdit = await this.getSimpleCreateEditCCA();
    return simpleCreateEditComp.isPrimaryActionDisabled();
  }

  public async selectCustomer(customer: string, desc?: string): Promise<void> {
    const optionEl: OjSelectSingle = await ojSelectSingle (this.driver, LOCATORS.ORDER_CUSTOMER_INPUT_ID);
    await optionEl.changeValue(Config.CUSTOMERS.get(customer));
    if (!!desc) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
  }
  public async getCustomerPhoneNumber(): Promise<string> {
    let phoneNumber: OJSpectraInputPhoneNumber = await oJSpectraInputPhoneNumber(this.driver, LOCATORS.ORDER_PHONE_ID);
    return (await phoneNumber.getValue())?.subscriberNumber;
  }

  public async getCustomerShippingAddress(): Promise<object> {
    let shippingAddress: OJSpectraInputAddress = await oJSpectraInputAddress(this.driver, LOCATORS.SHIPPING_ADDRESS);
    return shippingAddress.getAddressData();
  }

  public async addLine(): Promise<void> {
    const button: OjButton = await ojButton(this.driver, LOCATORS.ADD_LINE_ID);
    await button.whenReady();
    await BrowserUtil.ensureVisible(this.driver, button);
    await button.isEnabled();
    await button.doAction();
  }

  public async getCurrentLine(): Promise<object> {
    const table: OjTable = await ojTable (this.driver, LOCATORS.ORDER_TABLE_ID);
    return await table.getCurrentRow();
  }

  public async selectProduct(lineIdx: number, productId: number): Promise<void> {
    const select: OjSelectSingle = await ojSelectSingle (this.driver, By.id(`${Config.SELECT_PRODUCT_ID}${lineIdx}`));
    await select.whenReady();
    await this.driver.wait(until.elementIsEnabled(select));
    await BrowserUtil.ensureVisible(this.driver, select);
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
    if (!!desc ) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
  }

  public async clickOnCancelButton(desc?: string): Promise<void> {
    const simpleCreateEditComp: OJSpectraSimpleCreateEdit = await this.getSimpleCreateEditCCA();
    await simpleCreateEditComp.triggerCancelAction();

    if (!!desc) {
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
    if (!!desc ) {
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