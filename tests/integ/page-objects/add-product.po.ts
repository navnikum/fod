
import { OjSelectSingle, ojSelectSingle, ojButton, OjButton, ojWebElement, OjWebElement,OjInputText, ojInputText, OjTextArea, ojTextArea, OjInputNumber, ojInputNumber, OjInputDate, ojInputDate } from '@oracle/oraclejet-webdriver/elements';
import { Log } from '@spectra/automation-utils/auto-lib/Log';
import { By, WebDriver, until } from 'selenium-webdriver';

import { oJSpectraGuidedProcess,OJSpectraGuidedProcess } from '@spectra/oj-spectra-webdriver/oj-sp-guided-process';
import { oJSpectraHeaderGeneralOverview } from '@spectra/oj-spectra-webdriver/oj-sp-header-general-overview';
import { OJSpectraHeaderGeneralOverview } from '@spectra/oj-spectra-webdriver/oj-sp-header-general-overview/OJSpectraHeaderGeneralOverview';
import { BasePage } from '@taui/fa-common-lib/lib/page/base-page';
import { PageType } from '@taui/fa-common-lib/lib/page/page-type';

import { Config } from '../util/Config';
import momentTz from 'moment-timezone';


const LOCATORS: any = {
  GDP_CCA_ID : By.id(Config.GDPCCA_ID),
  SUPPLIER_INPUT_ID :By.id(Config.SUPPLIER_INPUT_ID),
  PRODUCT_INPUT_ID :By.id(Config.PRODUCT_INPUT_ID),
  DESCRIPTION_INPUT_CSS :By.css("oj-text-area[id^='ui-id-']"),
  PRODUCT_NAME_STEP2 :By.xpath("descendant::oj-input-text[contains(@id,'ui-id')][1]"),
  DESCRIPTION_STEP2 :By.xpath("descendant::oj-input-text[contains(@id,'ui-id')][2]"),
  CATEGORY_INPUT_ID :By.id(Config.CATEGORY_INPUT_ID),
  CATEGORY_ERROR_CSS :By.css("span[class='oj-component-icon oj-message-status-icon oj-message-error-icon']"),
  MSRP_XAPTH_STEP3:By.xpath("descendant::oj-input-text[contains(@id,'_input_currency')][1]"),
  COST_PER_UNIT_STEP3:By.xpath("descendant::oj-input-text[contains(@id,'_input_currency')][2]"),
  PRICE_STEP3:By.xpath("descendant::oj-input-text[contains(@id,'_input_currency')][3]"),
  MARGIN_STEP3: By.css("oj-input-number[id^='ui-id']"),
  MINORDER_XPATH:By.xpath("descendant::oj-input-number[contains(@id,'ui-id')][1]"),
  SUPPLIER_INVETORY_XPATH:By.xpath("descendant::oj-input-number[contains(@id,'ui-id')][2]"),
  SUPPLIER_DATE_XPATH:By.xpath("descendant::oj-input-date[contains(@id,'ui-id')]"),
  INITIAL_AMOUNT_XPATH:By.xpath("descendant::oj-input-number[contains(@id,'ui-id')][3]"),
  LOWSTOCK_THRESHOLD_XPATH:By.xpath("descendant::oj-input-number[contains(@id,'ui-id')][4]"),
  REORDER_AMOUNT_XPATH:By.xpath("descendant::oj-input-number[contains(@id,'ui-id')][5]"),
  SUPPLIER_ARRIVAL_DATE_XPATH:By.xpath("descendant::oj-input-date[contains(@id,'ui-id')][1]"),
  ACTIVATION_DATE_XPATH:By.xpath("descendant::oj-input-date[contains(@id,'ui-id')][2]"),
  DEACTIVATION_DATE_XPATH:By.xpath("descendant::oj-input-date[contains(@id,'ui-id')][3]"),
  ADD_PRODUCT_ACTIVATION:By.id(Config.ADD_PRODUCT_ACTIVATION),
  CANCEL_BTN_PRODUCT_ACTIVATION:By.id(Config.CANCEL_BTN_PRODUCT_ACTIVATION)
};

export class AddProductPage extends BasePage{
  private basepage: BasePage;
  

  constructor(driver: WebDriver) {
    super(driver, PageType.JET);
    this.driver = driver;
  }

 
  public async getProcessTitle(): Promise<any> {
    const guidedProcessComp: OJSpectraGuidedProcess = await this.getGuidedProcessCCA();
    return guidedProcessComp.getProcessTitle();
  }
  public async getSteps(): Promise<any[]> {
    const guidedProcessComp: OJSpectraGuidedProcess = await this.getGuidedProcessCCA();
    return guidedProcessComp.getSteps();
  }
  public async selectSupplier(supplier: string): Promise<void> {
   const optionEl: OjSelectSingle = await ojSelectSingle (this.driver, LOCATORS.SUPPLIER_INPUT_ID);
    await optionEl.changeValue(Config.SUPPLIERS_NAME.get(supplier));
  }
 
  public async checkProduct(): Promise<boolean> {
    const optionEl: OjSelectSingle = await ojSelectSingle (this.driver, LOCATORS.PRODUCT_INPUT_ID);
   return  await optionEl.isEnabled();
  }
  public async checkDesceription(): Promise<boolean> {
    const optionEl: OjTextArea = await ojTextArea (this.driver, LOCATORS.DESCRIPTION_INPUT_CSS);
   return  await optionEl.isEnabled();
  }
  public async selectProductname(productName: string): Promise<void> {
    const optionEl: OjSelectSingle = await ojSelectSingle (this.driver, LOCATORS.PRODUCT_INPUT_ID);
    await optionEl.whenReady();
    await optionEl.changeValue(Config.PRODUCT_NAME.get(productName));
  }
  public async selectCategory(category: string): Promise<void> {
    const optionEl: OjSelectSingle = await ojSelectSingle (this.driver, LOCATORS.CATEGORY_INPUT_ID);
    await optionEl.whenReady();
    await optionEl.changeValue(Config.CATEGORY.get(category));
  }
  public async getProductname(): Promise<string > {
    const optionEl: OjSelectSingle = await ojSelectSingle (this.driver, LOCATORS.PRODUCT_INPUT_ID);
    await optionEl.whenReady();
    return await optionEl.getValue();
  }

  public async getSupplierNumber(): Promise<string> {
    const suppName: OjInputText = await ojInputText(this.driver, By.xpath("descendant::oj-input-text[contains(@id,'ui-id')][1]"));
   return await suppName.getRawValue();  
  }
  public async getProductNumber(): Promise<string> {
    const suppName: OjInputText = await ojInputText(this.driver, By.xpath("descendant::oj-input-text[contains(@id,'ui-id')][2]"));
    return await suppName.getRawValue();  
  }

  /* Step 2 Actions   ................*/
  public async getProductNameOnStep2(): Promise<string> {
    const suppName: OjInputText = await ojInputText(this.driver, LOCATORS.PRODUCT_NAME_STEP2);
    return await suppName.getRawValue();  
  }
  public async getDescription(): Promise<string> {
    const suppName: OjTextArea = await ojTextArea(this.driver, By.css("oj-text-area[id^='ui-id-']"));
    return await suppName.getRawValue();
  }
  public async getDescriptionOnStep2(): Promise<string> {
    const suppName: OjInputText= await ojInputText(this.driver, LOCATORS.DESCRIPTION_STEP2);
    return await suppName.getRawValue();
  }
  /*------------------------------------- */
  /* Step 3 Actions   ................*/
  public async getMsrp(): Promise<string> {
    const msrp: OjInputText= await ojInputText(this.driver, LOCATORS.COST_PER_UNIT_STEP3);
    return await msrp.getRawValue();
  }
  public async getPriceStep3(): Promise<string> {
    const price: OjInputText= await ojInputText(this.driver, LOCATORS.PRICE_STEP3);
    return await price.getRawValue();
  }
  public async getMargin(): Promise<string> {
    const margin: OjInputNumber= await ojInputNumber(this.driver, LOCATORS.MARGIN_STEP3);
    return await margin.getRawValue();
  }

  
  public async getCostPerUnit(): Promise<string> {
    const cpu: OjInputText= await ojInputText(this.driver, LOCATORS.MSRP_XAPTH_STEP3);
    return await cpu.getRawValue();
  }
  public async clickStart(): Promise<void> {
    const guidedProcessComp: OJSpectraGuidedProcess = await this.getGuidedProcessCCA();
    await guidedProcessComp.triggerStartAction();
  }
  public async checkError(): Promise<boolean> {
    const error: OjWebElement = await ojWebElement(this.driver,LOCATORS.CATEGORY_ERROR_CSS );
    return await error.isDisplayed()  
  }
 /*------------------------------------- */

/* Step 4 Actions   ................*/
public async getMinimumOrder(): Promise<string> {
  const minOrder: OjInputNumber= await ojInputNumber(this.driver,LOCATORS.MINORDER_XPATH );
  return await minOrder.getRawValue();  
}
public async getSuppliersInventory(): Promise<string> {
  const suppInv: OjInputNumber= await ojInputNumber(this.driver,LOCATORS.SUPPLIER_INVETORY_XPATH );
  return await suppInv.getRawValue();  
}

public async getSuppliersEstimatedDate(): Promise<string> {
  const date: OjInputDate= await ojInputDate(this.driver,LOCATORS.SUPPLIER_DATE_XPATH );
  return await date.getRawValue();  
}
public async getInitialOrderAmt(): Promise<string> {
  const amt: OjInputNumber= await ojInputNumber(this.driver,LOCATORS.INITIAL_AMOUNT_XPATH );
  return await amt.getRawValue();  
}
public async setInitialOrderAmt(amount:number): Promise<void> {
  const amt: OjInputNumber= await ojInputNumber(this.driver,LOCATORS.INITIAL_AMOUNT_XPATH );
  await amt.changeValue(amount);
}
public async getLowStockThreshold(): Promise<string> {
  const elm: OjInputNumber= await ojInputNumber(this.driver,LOCATORS.LOWSTOCK_THRESHOLD_XPATH );
  return await elm.getRawValue();  
}
public async setLowStockThreshold(amount:number): Promise<void> {
  const elm: OjInputNumber= await ojInputNumber(this.driver,LOCATORS.LOWSTOCK_THRESHOLD_XPATH );
  await elm.changeValue(amount);
}
public async getReOrderAmt(): Promise<string> {
  const elm: OjInputNumber= await ojInputNumber(this.driver,LOCATORS.REORDER_AMOUNT_XPATH );
  return await elm.getRawValue();  
}
public async setReOrderAmt(amount:number): Promise<void> {
  const elm: OjInputNumber= await ojInputNumber(this.driver,LOCATORS.REORDER_AMOUNT_XPATH );
  await elm.changeValue(amount);
}

/* ................. ................*/

/* Step 5 Actions   ................*/
public async getSupplierArrivalDate(): Promise<string> {
  const elm: OjInputDate= await ojInputDate(this.driver,LOCATORS.SUPPLIER_ARRIVAL_DATE_XPATH );
  return await elm.getRawValue();  
}

public async getActivationDate(): Promise<string> {
  const elm: OjInputDate= await ojInputDate(this.driver,LOCATORS.ACTIVATION_DATE_XPATH );
  return await elm.getRawValue();
}
public async setActivationDate(date:string): Promise<void> {
  const elm: OjInputDate= await ojInputDate(this.driver,LOCATORS.ACTIVATION_DATE_XPATH );
  await elm.changeValue(date);
}

public async setDeActivationDate(date:string): Promise<void> {
  const elm: OjInputDate= await ojInputDate(this.driver,LOCATORS.DEACTIVATION_DATE_XPATH );
  await elm.changeValue(date);
}

public async getCurrentDate(): Promise<string> {
 let todaysDate = momentTz();
 const today:string = todaysDate.tz('America/Los_Angeles').format('MM-DD-YY');
 return today;
}
public async getbackDate(days:number): Promise<string> {
  let todaysDate = momentTz();
  const prevDate:string = (todaysDate.subtract(days,'days')).tz('America/Los_Angeles').format('MM-DD-YY')
  return prevDate;
 }
 public async getFutureDate(days:number): Promise<string> {
  let todaysDate = momentTz();
  const prevDate:string = (todaysDate.add(days,'days')).tz('America/Los_Angeles').format('MM-DD-YY')
  return prevDate;
 }

 public async clickAddProduct(): Promise<void> {
  const doneBtn: OjButton = await ojButton(this.driver, LOCATORS.ADD_PRODUCT_ACTIVATION);
  await doneBtn.click();
}

public async clickCancel(): Promise<void> {
  const doneBtn: OjButton = await ojButton(this.driver, LOCATORS.CANCEL_BTN_PRODUCT_ACTIVATION);
  await doneBtn.click();
}
public async getMessageText(): Promise<string> {
  try {
    const messages: OjWebElement = await ojWebElement(this.driver, By.id(Config.MESSAGE_ID));
    const msg: OjWebElement = await messages.findElement(By.tagName('oj-message')) as OjWebElement;
    await this.driver.wait(until.elementLocated(By.id(Config.MESSAGE_ID)));
    let msgText: string = '';
    if (msg) {
      const text: string = await msg.getText();
    }
    return msgText;
  }
  catch (err) {
    return null;
  }
}

public async getProductInventoryPageTitle(): Promise<string>{
  await this.waitForPageReady();
  const headerOverview = await oJSpectraHeaderGeneralOverview(this.driver,By.css('oj-sp-header-general-overview'));
  return headerOverview.getPageTitle();
}
/* ................. ................*/


  public async clickContinueOnExpandedView(): Promise<void> {
    const guidedProcessComp: OJSpectraGuidedProcess = await this.getGuidedProcessCCA();
      await guidedProcessComp.triggerContinueOnExpandedAction();
  }
  private async getGuidedProcessCCA(): Promise<OJSpectraGuidedProcess> {
    return oJSpectraGuidedProcess(this.driver, By.id('add-product-guided-process'));
  }
 
  
}
