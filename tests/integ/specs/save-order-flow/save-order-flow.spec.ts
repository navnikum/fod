import "mocha";
import ojwd, { DriverManager as dm } from "@oracle/oraclejet-webdriver";
import { expect } from "chai";
import { WebDriver } from "selenium-webdriver";
import { WelcomePage } from "../../page-objects/welcome.po";
import { CreateOrderMainPage } from "../../page-objects/create-order-main.po";
import { EditOrderDetailPage } from "../../page-objects/edit-order-detail.po";
import { ViewCustomerOrder } from "../../page-objects/view-customer-order.po";
import { Config } from "../../util/Config";
import { AppUtil } from "@taui/fa-common-lib/lib/utilities/app-util/app-util";
import { PageType } from "@taui/fa-common-lib/lib/page/page-type";
import { BrowserUtil } from "@taui/fa-common-lib/lib/utilities/browser/browser-util";
import { Tag } from "@taui/fa-common-lib/lib//utilities/tag";
import { UPSTREAM } from "@taui/fa-common-lib/lib/utilities/tag";
import { InventoryDetailPage } from "../../page-objects/inventory-details.po";

let isDIT: boolean = false;
let url: string;

describe(`Save Order Flow test`, () => {
  let driver: WebDriver;
  let welcomePage: WelcomePage;
  let createOrderMainPage: CreateOrderMainPage;
  let editOrderDetailPage: EditOrderDetailPage;
  let viewCustomerOrder: ViewCustomerOrder;
  let inventoryDetailPage: InventoryDetailPage;
  let savedOrderID: string;
  let savedContextInfo: Array<{ label: string; value: string }>;
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

  it(`Verify table is loaded and displayed with data ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const listRowData: any = await createOrderMainPage.getListRowData(1);
    expect(listRowData).to.not.equal(null);
    const numOfResults: string = await createOrderMainPage.getNumOfResults();
    //number of results string is not shown (looks nice)
    expect(numOfResults).to.equal(null);
  });

  it(`Click Create button should navigate to Create Order page ${Tag.get(
    UPSTREAM
  )}`, async () => {
    editOrderDetailPage = await createOrderMainPage.navigateToCreatePage();
    const title: string = await editOrderDetailPage.getPageTitle();
    expect(title).to.include(Config.EDIT_ORDER_PAGE_TITLE);
  });

  it(`Select customer Gary Jenkins and display updates properly ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await editOrderDetailPage.selectCustomer("Gary Jenkins");
    const customerInfo: object =
      await editOrderDetailPage.getCustomerShippingAddress();
    expect(customerInfo).to.not.equal(null);
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

  it(`Add a line ${Tag.get(UPSTREAM)}`, async () => {
    await editOrderDetailPage.addLine();
    await editOrderDetailPage.selectProduct(0, 2);
    await editOrderDetailPage.setQuantity(0, 1);
    await editOrderDetailPage.saveOrderLine(0);
  });

  it(`Add a second line ${Tag.get(UPSTREAM)}`, async () => {
    // Workaround to please JET 12 & 13 - see https://jira.oraclecorp.com/jira/browse/JET-49739, to be removed after moving to JET 13
    const jetVersion: string = await driver.executeScript<string>('return oj.version');
    const index: number = Number.parseInt(jetVersion.substring(0, jetVersion.indexOf('.'))) >= 13 ? 0 : 1;

    await editOrderDetailPage.addLine();
    await editOrderDetailPage.selectProduct(index, 4);
    await editOrderDetailPage.setQuantity(index, 2);
    await editOrderDetailPage.saveOrderLine(index);
  });

  it(`Click Save button and verify page changes to the Edit Order ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await editOrderDetailPage.clickOnSaveButton(`RRA_SaveOrder_${browser}`);
    const title: string = await editOrderDetailPage.getPageTitle();
    expect(title).to.include(Config.EDIT_ORDER_PAGE_TITLE);
    savedOrderID = await editOrderDetailPage.getOrderId();
    expect(savedOrderID).to.contains("F");
  });

  it(`Verify saved context info is correct ${Tag.get(UPSTREAM)}`, async () => {
    savedContextInfo = await editOrderDetailPage.getContextualInfo();
    expect(savedContextInfo[0].value).to.equal("Gary Jenkins");
    expect(savedContextInfo[1].value).to.not.equal(null);
    // Test fails in DIT due to currency value not displayed in currency format issue 27
    if (!isDIT) {
      expect(savedContextInfo[2].value).to.equal("Total Amount: $383.00");
    }
  });

  it(`Click Cancel button should navigate back to RRA main page ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await editOrderDetailPage.clickOnCancelButton();
    await welcomePage.navigateToInventoryDetailPage(InventoryDetailPage); // False navigation as it take some time for the order to change into processing status
    await welcomePage.navigateToManagerOrderPage(CreateOrderMainPage);
    // Commented out due to non-consistent behavior on smart search filter adapter component
    // const numOfResults: string = await createOrderMainPage.getNumOfResults();
    // expect(numOfResults).to.not.equal(null);
  });

  it(`Search for saved order and should find the result in the list ${Tag.get(
    UPSTREAM
  )}}`, async () => {
    await createOrderMainPage.addFilter(
      savedOrderID,
      `RRA_SearchSavedOrder_${browser}`
    );
    const numOfResults: string = await createOrderMainPage.getNumOfResults();
    expect(numOfResults).to.not.equal("0");
  });

  it(`Invoke Edit action for this saved order and should find the result in the list ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const orderIndex: string = savedOrderID.substring(
      savedOrderID.lastIndexOf("F") + 1
    );
    await createOrderMainPage.triggerOrderAction(
      orderIndex,
      "edit-order",
      `RRA_EditSavedOrder_${browser}`,
      false
    );
    await driver.wait(ojwd.pageReady());
    // await createOrderMainPage.triggerOrderAction(orderIndex, 'edit-order', `Fod_EditSavedOrder_${browser}`);
    let editOrderID: string = await editOrderDetailPage.getOrderId();
    expect(editOrderID).to.equal(savedOrderID);
  });

  it(`Verify context info are retrieved and displayed OK same as when saved ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const retrievedContext: Array<{ label: string; value: string }> =
      await editOrderDetailPage.getContextualInfo();
    expect(retrievedContext[0].value).to.equal(savedContextInfo[0].value);
    expect(retrievedContext[1].value).to.equal(savedContextInfo[1].value);
    expect(retrievedContext[2].value).to.equal(savedContextInfo[2].value);
  });

  it(`Click Cancel should return to manage-order page ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await editOrderDetailPage.clickOnCancelButton();
    const listRowData: any = await createOrderMainPage.getListRowData(1);
    expect(listRowData).to.not.equal(null);
  });

  it(`Search for saved order and verify matching records are displayed the list `, async () => {
    await createOrderMainPage.addFilter(
      savedOrderID,
      `RRA_SearchDraftOrder_${browser}`
    );
    const numOfResults: string = await createOrderMainPage.getNumOfResults();
    expect(numOfResults).to.not.equal("0");
  });

  it(`Invoke View Customer from a record and Item Overview page should load fine ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const saveOrder: string = await createOrderMainPage.getListItemData(0, 1);
    const orderIndex: string = saveOrder.substring(
      saveOrder.lastIndexOf("F") + 1
    );
    await createOrderMainPage.triggerOrderAction(
      orderIndex,
      "view-customer",
      `RRA_DraftViewCustomer_${browser}`
    );
    viewCustomerOrder = await new ViewCustomerOrder(driver);
    const title: string = await viewCustomerOrder.getItemTitle();
    expect(title).not.equal(null);
  });

  it(`Invoke Edit Order should navigate to edit order page ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const itemID: string = await viewCustomerOrder.getListItemId("Draft");
    await viewCustomerOrder.triggerCustomOrderAction(
      itemID,
      "edit-order",
      `RRA_EditDraftOrderForCustomer_${browser}`
    );
    const editOrderID: string = await editOrderDetailPage.getPageHeaderTitle();
    expect(editOrderID).to.not.equal(null);
  });

  it(`Click Cancel should return to Item Overview page ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await editOrderDetailPage.clickOnCancelButton();
    const title: string = await viewCustomerOrder.getItemTitle();
    expect(title).not.equal(null);
  });

  it(`Invoke Delete Order should display Delete confirmation warning ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const itemID: string = await viewCustomerOrder.getListItemId("Draft");
    await viewCustomerOrder.triggerCustomOrderAction(
      itemID,
      "delete-order",
      `RRA_DeleteDraftOrderForCustomer_${browser}`
    );
  });

  it(`Confirm delete and draft should not be present in the list ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await createOrderMainPage.confirmDelete(true);
    const message: string = await createOrderMainPage.getMessageText(
      `RRA_DeleteDraftOrderForCustomer_${browser}`
    );
    if (message != null) {
      expect(message).to.contains(`Order Number`);
    }
  });

  after(async () => {
    if (isDIT) {
      await welcomePage.logOut();
    }
    dm.releaseDriver(driver);
  });
});
