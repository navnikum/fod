import { ojWebElement, OjWebElement } from '@oracle/oraclejet-webdriver/elements';
import {By, until, WebDriver, WebElement} from 'selenium-webdriver';
import {Config} from '../util/Config';
import {EditOrderDetailPage} from './edit-order-detail.po';
import { oJSpectraAskOracleUserProfile, OJSpectraAskOracleUserProfile } from '@spectra/oj-spectra-webdriver/oj-sp-ask-oracle-user-profile/index';
import { oJSpectraAskOracle, OJSpectraAskOracle } from '@spectra/oj-spectra-webdriver/oj-sp-ask-oracle/index';
import { oJSpectraWelcomePage, OJSpectraWelcomePage } from '@spectra/oj-spectra-webdriver/oj-sp-welcome-page';
import { ojSpectraObjectCard, OjSpectraObjectCard } from '@spectra/oj-spectra-webdriver/oj-sp-object-card';
import {BasePage} from '@taui/fa-common-lib/lib/page/base-page';
import {ScreenShotUtil} from '@taui/fa-common-lib/lib/utilities/screen-shot/screen-shot-util';
import {PageType} from '@taui/fa-common-lib/lib/page/page-type';
import {BrowserUtil} from '@taui/fa-common-lib/lib/utilities/browser/browser-util';
import {PageConstructor} from '../util/page-constructor'

const LOCATORS: any = {
  ASKORACLE_ID: By.id(Config.ASKORACLE_ID),
  SHELL_ID: By.id(Config.SHELL_ID),
  WELCOME_ID: By.id(Config.WELCOME_ID),
  WELCOME_LIST_ID: By.id(Config.WELCOME_LIST_ID),
  OBJECT_CARD_TAG: By.css(Config.OBJECT_CARD_TAG)
};

export class WelcomePage extends BasePage {

  constructor(driver: WebDriver) {
    super(driver, PageType.JET);
    this.driver = driver;
  }

  public async isAskOracleEnabled(isDIT?: boolean): Promise<boolean> {
    const isAskOracleEnabled: string = await this.driver.executeScript('return window.faConfig.PROFILE.ORA_ASK_ORACLE_ENABLED;');
    return isAskOracleEnabled === 'Y';
  }

  public async getPageTitle(isDIT?: boolean): Promise<string> {
    //Wait for page to be ready is not enough, need ensure shell exists then be able to get the title. Potential bug?
    const isAskOracleEnabled: boolean = await this.isAskOracleEnabled(isDIT);
    const shellLocator: By = isAskOracleEnabled ? LOCATORS.ASKORACLE_ID : LOCATORS.SHELL_ID;
    await this.driver.wait(until.elementLocated(shellLocator));

    const shell: OjWebElement = await ojWebElement(this.driver, shellLocator);
    await shell.whenReady();

    return this.driver.getTitle();
  }

  public async getHeaderWelcomeBanner(): Promise<string> {
    await this.driver.wait(until.elementLocated(LOCATORS.WELCOME_ID));
    const hwb: OJSpectraWelcomePage = await oJSpectraWelcomePage(this.driver, LOCATORS.WELCOME_ID);
    await hwb.whenReady();
    return hwb.getPageTitle();
  }

  public async getDescriptionWelcomeBanner(): Promise<string> {
    await this.driver.wait(until.elementLocated(LOCATORS.WELCOME_ID));
    const hwb: OJSpectraWelcomePage = await oJSpectraWelcomePage(this.driver, LOCATORS.WELCOME_ID);
    await hwb.whenReady();
    return hwb.getDescriptionText();
  }

  public async getOrderNumberObjectCard(): Promise<string> {
    await this.driver.wait(until.elementLocated(LOCATORS.WELCOME_LIST_ID));
    const soc: OjSpectraObjectCard = await ojSpectraObjectCard(this.driver, LOCATORS.OBJECT_CARD_TAG);
    await soc.whenReady();
    return soc.getLabel();
  }

  public async getCustomerNameObjectCard(): Promise<string> {
    await this.driver.wait(until.elementLocated(LOCATORS.WELCOME_LIST_ID));
    const soc: OjSpectraObjectCard = await ojSpectraObjectCard(this.driver, LOCATORS.OBJECT_CARD_TAG);
    await soc.whenReady();
    return soc.getPrimaryText();
  }

  public async getOrderStatusObjectCard(): Promise<string> {
    await this.driver.wait(until.elementLocated(LOCATORS.WELCOME_LIST_ID));
    const soc: OjSpectraObjectCard = await ojSpectraObjectCard(this.driver, LOCATORS.OBJECT_CARD_TAG);
    await soc.whenReady();
    return soc.getSecondaryText();
  }

  public async getAmountObjectCard(): Promise<string> {
    await this.driver.wait(until.elementLocated(LOCATORS.WELCOME_LIST_ID));
    const soc: OjSpectraObjectCard = await ojSpectraObjectCard(this.driver, LOCATORS.OBJECT_CARD_TAG);
    await soc.whenReady();
    return soc.getTertiaryText();
  }

  public async navigateToEditOrderPage(desc?: string): Promise<EditOrderDetailPage> {
    await this.driver.wait(until.elementLocated(LOCATORS.WELCOME_LIST_ID));
    const soc: OjSpectraObjectCard = await ojSpectraObjectCard(this.driver, LOCATORS.OBJECT_CARD_TAG);
    await soc.whenReady();
    await BrowserUtil.ensureVisible(this.driver, soc);
    const ocid: string = await soc.getAttribute('id');
    await soc.triggerPrimaryAction(ocid.split('order-card-')[1]);
    if (!!desc ) {
      await ScreenShotUtil.takeScreenShot(desc, this.driver);
    }
    return new EditOrderDetailPage(this.driver);
  }

  public async navigateToManagerOrderPage<Page>(page: PageConstructor<Page>, desc?: string): Promise<Page> {
    await this.navigateTo(Config.APP_NAVIGATION_MANAGE_ORDERS_KEY, desc);
    return new page(this.driver);
  }

  public async navigateToInventoryDetailPage<Page>(page: PageConstructor<Page>, desc?: string): Promise<Page> {
    await this.navigateTo(Config.APP_NAVIGATION_INVENTORY_KEY, desc);
    return new page(this.driver);
  }
  public async navigateToTrainingPage<Page>(page: PageConstructor<Page>, desc?: string): Promise<Page> {
    await this.navigateTo(Config.APP_NAVIGATION_TRAINING_KEY, desc);
    return new page(this.driver);
  }

  public async navigateToAnalyticsPage<Page>(page: PageConstructor<Page>, desc?: string): Promise<Page> {
    await this.navigateTo(Config.APP_NAVIGATION_ANALYTICS_KEY, desc);
    return new page(this.driver);
  } 

  public async logOut(): Promise<void> {
    if ((await this.isAskOracleEnabled())) {
      const askOracle: OJSpectraAskOracle = await oJSpectraAskOracle(this.driver, By.id(Config.ASKORACLE_ID));
      await askOracle.expandAskOracle();
      const askOracleProfile: OJSpectraAskOracleUserProfile = await oJSpectraAskOracleUserProfile(this.driver, By.id(Config.ASKORACLE_PROFILE_ID));
      await askOracleProfile.onClickUserProfile();
      await askOracleProfile.onClickLogOut();
      await askOracleProfile.whenBusyContextReady();
    } else {
      const userProfile: OjWebElement = await ojWebElement(this.driver, By.id(Config.USERPROFILE_ID));
      await userProfile.click();
      await userProfile.whenReady();
      const signOut: OjWebElement = await ojWebElement(this.driver, By.id(Config.SIGNOUT_ID));
      await signOut.click();
    }
    await this.driver.wait(until.elementLocated(By.id(Config.CONFIRM_ID)));
    const button: WebElement = await this.driver.findElement(By.id(Config.CONFIRM_ID));
    await this.driver.wait(until.elementIsVisible(button));
    await button.click();
  }

  public async navigateTo(targetItem: string, desc?: string): Promise<void> {
    // Temporary solution until oj-sp-in-app-navigation adapter gets fixed for selection action event
    await this.driver.wait(until.elementLocated(By.css(`#${Config.APP_NAVIGATION_ID}_navItem_${targetItem} a`)));
    const navLink: WebElement = await this.driver.findElement( By.css(`#${Config.APP_NAVIGATION_ID}_navItem_${targetItem} a`));
    await navLink.click();

    // const appNavigation: OJSpectraInAppNavigation = await oJSpectraInAppNavigation(this.driver, By.id(Config.APP_NAVIGATION_ID));
    // await appNavigation.changeSelection(targetItem);

    // if (!!desc ) {
    //   await ScreenShotUtil.takeScreenShot(desc, this.driver);
    // }
  }
}
