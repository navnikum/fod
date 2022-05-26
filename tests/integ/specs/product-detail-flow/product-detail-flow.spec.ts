import "mocha";
import ojwd, { DriverManager as dm } from "@oracle/oraclejet-webdriver";
import { expect } from "chai";
import { WebDriver } from "selenium-webdriver";
import { InventoryDetailPage } from "../../page-objects/inventory-details.po";
import { WelcomePage } from "../../page-objects/welcome.po";
import { ProductDetailPage } from "../../page-objects/product-detail.po";
import { Config } from "../../util/Config";
import { CreateOrderMainPage } from "../../page-objects/create-order-main.po";
import { AppUtil } from "@taui/fa-common-lib/lib/utilities/app-util/app-util";
import { PageType } from "@taui/fa-common-lib/lib/page/page-type";
import { BrowserUtil } from "@taui/fa-common-lib/lib/utilities/browser/browser-util";
import { Tag, UPSTREAM } from "@taui/fa-common-lib/lib//utilities/tag";
import { Configure } from "@taui/fa-common-lib/lib/utilities/configure";

const configuration: Configure = Configure.parseConfiguration(
  "./tests/integ/config/test-configuration.json"
);
let isDIT: boolean = false;
let url: string;

describe(`Product Detail flow test`, () => {
  let driver: WebDriver;
  let welcomePage: WelcomePage;
  let inventoryDetailPage: InventoryDetailPage;
  let productDetailPage: ProductDetailPage;
  let createOrderMainPage: CreateOrderMainPage;
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
    await driver.sleep(4000);
    const title: string = await inventoryDetailPage.getPageTitle(isDIT);
    expect(title).to.include(Config.INVENTORY_PAGE_TITLE);
  });

  it(`Inventory smart page template Card action product detail ${Tag.get(
    UPSTREAM
  )}`, async () => {
    productDetailPage = await inventoryDetailPage.triggerProductDetailAction(
      5,
      "test",
      `RRA_InventoryCardPrimaryAction_${browser}`
    );
  });

  it(`Product Detail Folder Layout page Title Check ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const title: string = await productDetailPage.getPageTitle(isDIT);
    expect(title).to.include(Config.PRODUCT_DETAIL_PAGE_TILE);
  });

  it(`Product Detail Folder Supplier Contact Panel Title Check ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const title: string = await productDetailPage.getProductDetailPanelTitle(
      Config.SUPPLIER_CONATCT_PANEL
    );
    expect(title).to.equal("Supplier Contact Information");
  });

  it(`Product Detail Folder Supplier Product Panel Title Check ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const title: string = await productDetailPage.getProductDetailPanelTitle(
      Config.SUPPLIER_PRODUCT_PANEL
    );
    expect(title).to.equal("Supplier Product Information");
  });

  it(`Product Detail Folder Supplier Product Panel Title Check  ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const title: string = await productDetailPage.getProductDetailPanelTitle(
      Config.SUPPLIER_ORDER_PANEL
    );
    expect(title).to.equal("Orders");
  });

  it(`Product Detail Page View All Data  ${Tag.get(UPSTREAM)}`, async () => {
    const overflowLabel = await productDetailPage.getSummaryViewAll(
      `RRA_InventoryCardPrimaryAction_${browser}`
    );
    expect(overflowLabel).to.equal("View All Orders");
  });

  it(`Product Detail Page View All Click  ${Tag.get(UPSTREAM)}`, async () => {
    await productDetailPage.summaryViewAllClick(
      `RRA_ProductDetailViewAllAction_${browser}`
    );
    createOrderMainPage = await welcomePage.navigateToManagerOrderPage(
      CreateOrderMainPage,
      `RRA_InitManageOrder_${browser}`
    );
    const title: string = await createOrderMainPage.getPageTitle(isDIT);
    expect(title).to.include(Config.MANAGE_ORDERS_PAGE_TITLE);
  });

  after(async () => {
    if (isDIT) {
      await AppUtil.logout(driver, PageType.JET);
    }
    dm.releaseDriver(driver);
  });
});
