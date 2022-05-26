import "mocha";

import ojwd, { DriverManager as dm } from "@oracle/oraclejet-webdriver";
import { expect } from "chai";
import { WebDriver } from "selenium-webdriver";
import { WelcomePage } from "../../page-objects/welcome.po";
import { CreateOrderMainPage } from "../../page-objects/create-order-main.po";
import { EditOrderDetailPage } from "../../page-objects/edit-order-detail.po";
import { Config } from "../../util/Config";
import { AppUtil } from "@taui/fa-common-lib/lib/utilities/app-util/app-util";
import { PageType } from "@taui/fa-common-lib/lib/page/page-type";
import { BrowserUtil } from "@taui/fa-common-lib/lib/utilities/browser/browser-util";
import { Tag, UPSTREAM } from "@taui/fa-common-lib/lib/utilities/tag";
import { InventoryDetailPage } from "../../page-objects/inventory-details.po";
let isDIT: boolean = false;
let url: string;

describe(`Delete Order Flow test`, () => {
  let driver: WebDriver;
  let welcomePage: WelcomePage;
  let createOrderMainPage: CreateOrderMainPage;
  let editOrderDetailPage: EditOrderDetailPage;
  let savedOrderID: string;
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
      CreateOrderMainPage
    );
    const title: string = await createOrderMainPage.getPageTitle(isDIT);
    expect(title).to.include(Config.MANAGE_ORDERS_PAGE_TITLE);
  });

  it(`Click Create button should navigate to Create Order page ${Tag.get(
    UPSTREAM
  )}`, async () => {
    editOrderDetailPage = await createOrderMainPage.navigateToCreatePage();
    const title: string = await editOrderDetailPage.getPageTitle();
    expect(title).to.include(Config.EDIT_ORDER_PAGE_TITLE);
  });

  it(`Select customer Victor Morris and display updates properly ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await editOrderDetailPage.selectCustomer("Victor Morris");
    const customerInfo: object =
      await editOrderDetailPage.getCustomerShippingAddress();
    expect(customerInfo).to.not.equal(null);
  });

  it(`Add a line ${Tag.get(UPSTREAM)}`, async () => {
    await editOrderDetailPage.addLine();
    await editOrderDetailPage.selectProduct(0, 4);
    await editOrderDetailPage.setQuantity(0, 1);
    await editOrderDetailPage.saveOrderLine(0);
  });

  it(`Click Save button and verify page changes to the Edit Order ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await editOrderDetailPage.clickOnSaveButton();
    const title: string = await editOrderDetailPage.getPageTitle();
    expect(title).to.include(Config.EDIT_ORDER_PAGE_TITLE);
    savedOrderID = await editOrderDetailPage.getOrderId();
    expect(savedOrderID).to.contains("F");
  });

  it(`Click Cancel button should navigate back to RRA main page ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await editOrderDetailPage.clickOnCancelButton();
    const title: string = await createOrderMainPage.getPageTitle();
    expect(title).to.include(Config.MANAGE_ORDERS_PAGE_TITLE);
  });

  it(`Search for saved order and should find the result in the list ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await welcomePage.navigateToInventoryDetailPage(InventoryDetailPage); // False navigation as it take some time for the order to change into processing status
    await welcomePage.navigateToManagerOrderPage(CreateOrderMainPage);
    await createOrderMainPage.addFilter("Draft");
    await createOrderMainPage.addFilter(savedOrderID);
    const numOfResults: string = await createOrderMainPage.getNumOfResults(
      `RRA_SearchDraft_${browser}`
    );
    expect(numOfResults).to.equal("1");
  });

  it(`Delete this draft and draft should not be present in the list ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const orderIndex: string = savedOrderID.substring(
      savedOrderID.lastIndexOf("F") + 1
    );
    await createOrderMainPage.triggerOrderAction(orderIndex, "delete-order");
    await createOrderMainPage.confirmDelete(true);
    const message: string = await createOrderMainPage.getMessageText(
      `RRA_DeleteDraft_${browser}`
    );
    if (message != null) {
      expect(message).to.contains(`Order Number: ${orderIndex}`);
    }
  });

  it(`Verify deleted draft is not present in the list ${Tag.get(
    UPSTREAM
  )}`, async () => {
    // Page is not refreshed; workaround it by manually remove filter to trigger refresh. Need app fix.
    await createOrderMainPage.removeFilter(savedOrderID);
    await createOrderMainPage.addFilter(
      savedOrderID,
      `RRA_SearchDeletedDraft_${browser}`
    );
    expect(await createOrderMainPage.getListRowData(0)).to.equals(null);
  });
  after(async () => {
    if (isDIT) {
      await AppUtil.logout(driver, PageType.JET);
    }
    dm.releaseDriver(driver);
  });
});
