import "mocha";
import ojwd, { DriverManager as dm } from "@oracle/oraclejet-webdriver";
import { expect } from "chai";
import { WebDriver } from "selenium-webdriver";
import { WelcomePage } from "../../page-objects/welcome.po";
import { CreateOrderMainPage } from "../../page-objects/create-order-main.po";
import { EditOrderDetailPage } from "../../page-objects/edit-order-detail.po";
import { Config } from "../../util/Config";
import { Tag, UPSTREAM } from "@taui/fa-common-lib/lib/utilities/tag";
import { AppUtil } from "@taui/fa-common-lib/lib/utilities/app-util/app-util";
import { PageType } from "@taui/fa-common-lib/lib/page/page-type";
import { BrowserUtil } from "@taui/fa-common-lib/lib/utilities/browser/browser-util";

// tslint:disable: no-unused-expression
let isDIT: boolean = false;
let url: string;

describe(`Create Order Flow test`, () => {
  let driver: WebDriver;
  let welcomePage: WelcomePage;
  let createOrderMainPage: CreateOrderMainPage;
  let editOrderDetailPage: EditOrderDetailPage;
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

  it(`Initial Load RRA page should succeed ${Tag.get(UPSTREAM)}`, async () => {
    welcomePage = new WelcomePage(driver);
    createOrderMainPage = await welcomePage.navigateToManagerOrderPage(
      CreateOrderMainPage,
      `RRA_InitManageOrder_${browser}`
    );
    const title: string = await createOrderMainPage.getPageTitle(isDIT);
    expect(title).to.include(Config.MANAGE_ORDERS_PAGE_TITLE);
  });

  it(`Verify order list is loaded and displayed with data ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const listRowData: any = await createOrderMainPage.getListRowData(1);
    expect(listRowData).to.not.equal(null);
  });

  it(`Click Create button should navigate to Create Order page ${Tag.get(
    UPSTREAM
  )} `, async () => {
    editOrderDetailPage = await createOrderMainPage.navigateToCreatePage(
      `RRA_InitialCreate_${browser}`
    );
    const title: string = await editOrderDetailPage.getPageTitle();
    expect(title).to.include(Config.EDIT_ORDER_PAGE_TITLE);
  });

  it(`Verify the context info is correct ${Tag.get(UPSTREAM)}`, async () => {
    const contextualInfo: Array<{ label: string; value: string }> =
      await editOrderDetailPage.getContextualInfo();
    expect(contextualInfo[0].value).to.equal("");
    expect(contextualInfo[1].value).to.not.equal(null);
    // Test fail in DIT due to currency value not displayed in currency format issue27
    if (!isDIT) {
      expect(contextualInfo[2].value).to.equal("Total Amount: $0.00");
    }
  });

  it(`Select customer Gary Jenkins and display updates properly ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await editOrderDetailPage.selectCustomer(
      "Gary Jenkins",
      `RRA_SelectCustomer_${browser}`
    );
    const customerInfo: string =
      await editOrderDetailPage.getCustomerPhoneNumber();
    expect(customerInfo).to.not.equal(null);
  });

  it(`Verify shipping address info are all correct for customer Gary Jenkins ${Tag.get(
    UPSTREAM
  )}`, async () => {
    expect(await editOrderDetailPage.getCustomerShippingAddress()).to.not.equal(
      null
    );
  });

  it(`Edit comments and verify the contents ${Tag.get(UPSTREAM)}`, async () => {
    let comments: string = await editOrderDetailPage.getComments();
    expect(comments).to.equal(null);
    await editOrderDetailPage.editComments(
      "Customer quote documentation missing"
    );
    comments = await editOrderDetailPage.getComments();
    expect(comments).to.equal("Customer quote documentation missing");
  });

  it(`Click Cancel button should trigger dirty warning dialog ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await editOrderDetailPage.clickOnCancelButton(`RRA_BackToMain_${browser}`);
    const title: string = await createOrderMainPage.getPageTitle();
    expect(title).to.include(Config.EDIT_ORDER_PAGE_TITLE);
  });

  it(`Click Discard button should navigate back to RRA main page ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await editOrderDetailPage.confirmCancelWithChanges();
    const title: string = await createOrderMainPage.getPageTitle();
    expect(title).to.include(Config.MANAGE_ORDERS_PAGE_TITLE);
  });

  after(async () => {
    if (isDIT) {
      await AppUtil.logout(driver, PageType.JET);
    }
    dm.releaseDriver(driver);
  });
});
