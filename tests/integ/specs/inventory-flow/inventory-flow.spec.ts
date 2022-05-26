import "mocha";
import ojwd, { DriverManager as dm } from "@oracle/oraclejet-webdriver";
import { expect } from "chai";
import { Key, WebDriver } from "selenium-webdriver";
import { InventoryDetailPage } from "../../page-objects/inventory-details.po";
import { WelcomePage } from "../../page-objects/welcome.po";
import { ProductDetailPage } from "../../page-objects/product-detail.po";
import { Config } from "../../util/Config";
import { AppUtil } from "@taui/fa-common-lib/lib/utilities/app-util/app-util";
import { PageType } from "@taui/fa-common-lib/lib/page/page-type";
import { BrowserUtil } from "@taui/fa-common-lib/lib/utilities/browser/browser-util";
import { Tag, UPSTREAM } from "@taui/fa-common-lib/lib//utilities/tag";

// tslint:disable: no-unused-expression
let isDIT: boolean = false;
let url: string;

describe(`Inventory flow test`, () => {
  let driver: WebDriver;
  let welcomePage: WelcomePage;
  let inventoryDetailPage: InventoryDetailPage;

  const browser: string = process.env.browser as string;

  before(async () => {
    driver = await dm.getDriver("test");
    BrowserUtil.setWindowMaxSize(driver);
    url = process.env.baseURL as string;
    if (url.startsWith("https://") && url.includes("fscmUI")) {
      isDIT = true;
    }
  });

  it(`Login DIT environment with specified user account should be successful ${Tag.get(
    UPSTREAM
  )}`, async () => {
    if (isDIT) {
      await AppUtil.login(
        driver,
        url,
        Config.ADMIN_USERNAME,
        Config.ADMIN_PWD,
        PageType.JET,
        WelcomePage
      );
    } else {
      await ojwd.get(driver, url);
   /*   //-- Local run purpose --- defect#TACODEQ-667 
   await driver.get(url);
   await driver.wait(await ojwd.pageReady());
   */
    }
  });
  it(`Initial Load RRA page should succeed with title Check ${Tag.get(
    UPSTREAM
  )}`, async () => {
    welcomePage = new WelcomePage(driver);
    inventoryDetailPage = await welcomePage.navigateToInventoryDetailPage(
      InventoryDetailPage
    );
    // Required in local -- will reomve later
    await driver.sleep(4000);
    const title: string = await inventoryDetailPage.getPageTitle(isDIT);
    expect(title).to.include(Config.INVENTORY_PAGE_TITLE);
  });

  let firstCardPrimaryText: string;
  it(`Get inventory smart filter Data results ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const smartSearchData: any = await inventoryDetailPage.getNumOfResults();
    expect(smartSearchData).to.not.equal(null);
    firstCardPrimaryText = await inventoryDetailPage.cardData(1);
  });

  it(`Inventory smart add filter  ${Tag.get(UPSTREAM)}`, async () => {
    await inventoryDetailPage.addFilter(
      false,
      Config.INVENTORY_CARD_SEARCH_STRING,
      `RRA_InventoryFilterAdd_${browser}`
    );
    const numResults: string = await inventoryDetailPage.getNumOfResults();
    expect(numResults).to.equal("1");
  });

  it(`Inventory smart remove filter ${Tag.get(UPSTREAM)}`, async () => {
    await inventoryDetailPage.removeFilter(
      Config.INVENTORY_CARD_SEARCH_STRING,
      `RRA_InventoryFilterRemove_${browser}`
    );
    const numResults: string = await inventoryDetailPage.getNumOfResults();
    expect(Number.parseInt(numResults)).to.be.at.least(2);
  });

  // Can't valdidate as the card order is random
  it.skip(`Inventory smart page template Card data  ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const cardPrimaryText: string = await inventoryDetailPage.cardData(1);
    expect(cardPrimaryText).to.equal("TABLET15");
  });

  it(`Inventory smart page template Card action product detail ${Tag.get(
    UPSTREAM
  )} `, async () => {
    await driver.actions().sendKeys(Key.ESCAPE).perform();
    await inventoryDetailPage.triggerProductDetailAction(
      1,
      "test",
      `RRA_InventoryCardPrimaryAction_${browser}`
    );
    let productDetailPage: ProductDetailPage = new ProductDetailPage(driver);
    const title: string = await productDetailPage.getPageTitle(isDIT);
    expect(title).to.include(Config.PRODUCT_DETAIL_PAGE_TILE);
  });

  after(async () => {
    if (isDIT) {
      await AppUtil.logout(driver, PageType.JET);
    }
    dm.releaseDriver(driver);
  });
});
