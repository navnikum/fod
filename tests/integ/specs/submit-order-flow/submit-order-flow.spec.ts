import 'mocha';
import ojwd, {DriverManager as dm} from '@oracle/oraclejet-webdriver';
import {expect} from 'chai';
import {WebDriver,Key} from 'selenium-webdriver';
import {WelcomePage} from '../../page-objects/welcome.po';
import {CreateOrderMainPage} from '../../page-objects/create-order-main.po';
import {EditOrderDetailPage} from '../../page-objects/edit-order-detail.po';
import {ViewCustomerOrder} from '../../page-objects/view-customer-order.po';
import {Config} from '../../util/Config';
import {AppUtil} from '@taui/fa-common-lib/lib/utilities/app-util/app-util';
import {PageType} from '@taui/fa-common-lib/lib/page/page-type';
import {BrowserUtil} from '@taui/fa-common-lib/lib/utilities/browser/browser-util';
import {Tag, UPSTREAM} from '@taui/fa-common-lib/lib//utilities/tag';
import {Configure} from '@taui/fa-common-lib/lib/utilities/configure';
import { InventoryDetailPage } from '../../page-objects/inventory-details.po';


const configuration: Configure = Configure.parseConfiguration("./tests/integ/config/test-configuration.json");


let isDIT: boolean = false;
let url: string;

describe(`Submit Order Flow test`, () => {
  let driver: WebDriver;
  let welcomePage: WelcomePage;
  let createOrderMainPage: CreateOrderMainPage;
  let editOrderDetailPage: EditOrderDetailPage;
  let viewCustomerOrder: ViewCustomerOrder;
  let inventoryDetailPage: InventoryDetailPage;
  let submitOrder: string;
  let conveyorAmt :string ;
  let savedOrderID :string;
  const browser: string = process.env.browser as string;

  before(async () => {
    driver = await dm.getDriver('test');

    BrowserUtil.setWindowMaxSize(driver);
    url = process.env.baseURL as string;
    if (url.startsWith('https://') && url.includes('fscmUI')) {
      isDIT = true;
    }
  });



  it(`Login DIT environment with specified user account should be successful ${Tag.get(UPSTREAM)}`, async () => {
    if (isDIT) {
      await AppUtil.login(driver, url, Config.ADMIN_USERNAME, Config.ADMIN_PWD, PageType.JET, WelcomePage);
     } else {
       ojwd.get(driver, url);
     }
  });

  it(`Initial Load FOD page should succeed ${Tag.get(UPSTREAM)}`, async () => {
    welcomePage = new WelcomePage(driver);
    createOrderMainPage = await welcomePage.navigateToManagerOrderPage(CreateOrderMainPage);
    const title: string = await createOrderMainPage.getPageTitle(isDIT);
    expect(title).to.include(Config.MANAGE_ORDERS_PAGE_TITLE);
  });

  it(`Verify table is loaded and displayed with data ${Tag.get(UPSTREAM)}`, async () => {
    const listRowData: any = await createOrderMainPage.getListRowData(1);
    expect(listRowData).to.not.equal(null);
  });

  it(`Click Create button should navigate to Create Order page ${Tag.get(UPSTREAM)}`, async () => {
    editOrderDetailPage = await createOrderMainPage.navigateToCreatePage();
    const title: string = await editOrderDetailPage.getPageTitle();
    expect(title).to.include(Config.EDIT_ORDER_PAGE_TITLE);
  });

  it(`Select customer Gary Jenkins and display updates properly ${Tag.get(UPSTREAM)}`, async () => {
    await editOrderDetailPage.selectCustomer('Gary Jenkins');
    const customerInfo: object = await editOrderDetailPage.getCustomerShippingAddress();
    expect(customerInfo).to.not.equal(null);
  });

  it(`Add a line and verify the display is updated ${Tag.get(UPSTREAM)}`, async () => {
    const intialRow: object = await editOrderDetailPage.getCurrentLine();
    expect(intialRow).to.equal(null);
    await editOrderDetailPage.addLine();
    await editOrderDetailPage.selectProduct(0, 31);
    await editOrderDetailPage.setQuantity(0, 2);
    expect(await editOrderDetailPage.getCurrentLine()).to.not.equal(intialRow);
  });

  it(`Click Save Order line button and line is saved fine ${Tag.get(UPSTREAM)}`, async () => {
    await editOrderDetailPage.saveOrderLine(0, `Fod_SaveOrderLine_${browser}`);
    const currentRow = await editOrderDetailPage.getCurrentLine();
    expect(currentRow).to.not.equal(null);
    conveyorAmt = await createOrderMainPage.getConveyorAmt();
  });

  it(`Verify the context info is correct after saving a line ${Tag.get(UPSTREAM)}`, async () => {
    const contextualInfo: Array<{ label: string, value: string }>  = await editOrderDetailPage.getContextualInfo();
    expect(contextualInfo[0].value).to.equal('Gary Jenkins');
    expect(contextualInfo[1].value).to.not.equal(null);
    expect(contextualInfo[2].value).to.contains('Total Amount');
  });

  it(`Edit comments and verify the contents ${Tag.get(UPSTREAM)}`, async () => {
    let comments: string = await editOrderDetailPage.getComments();
    expect(comments).to.equal(null);
    await editOrderDetailPage.editComments('Customer quote documentation missing');
    comments = await editOrderDetailPage.getComments();
    expect(comments).to.equal('Customer quote documentation missing');
  });

  it(`Click Save button and verify page changes to the Edit Order ${Tag.get(UPSTREAM)}`, async () => {
    await editOrderDetailPage.clickOnSaveButton(`Fod_SaveOrder_${browser}`);
    const title: string = await editOrderDetailPage.getPageTitle();
    expect(title).to.include(Config.EDIT_ORDER_PAGE_TITLE);
    savedOrderID = await editOrderDetailPage.getOrderId();
  });

  it(`Click Submit button with Happy emoji and warning dialog pops up successfully ${Tag.get(UPSTREAM)}`, async () => {
    await createOrderMainPage.clickEmoSubmit('good');
    expect (await createOrderMainPage.checkSubmitDialog()).to.equal(true);
  });

  it(`Verify that the submit confirmation dialog has no title  ${Tag.get(UPSTREAM)}`, async () => {
    expect (await createOrderMainPage.getConfirmationDialogTitle()).to.equal(null);
  });

  it(`Verify that the submit confirmation has correct amount displayed ${Tag.get(UPSTREAM)}`, async () => {
    conveyorAmt = (conveyorAmt.split(':')[1]).trim();
    expect(await createOrderMainPage.getSubmitPopUpText()).to.equal(`Submit order for ${conveyorAmt}?`)
  });
  it(`Verify that on clicking cancel, the confirmation pop up disappears and user remains on the same page ${Tag.get(UPSTREAM)}`, async () => {
    await createOrderMainPage.confirmSubmit(false);
    expect (await createOrderMainPage.checkSubmitDialog()).to.equal(false);
    const title: string = await createOrderMainPage.getPageTitle();
    expect(title).to.include(Config.EDIT_ORDER_PAGE_TITLE);
  });
  it(`Verify accepting the confirmation pop up displays feedback dialog ${Tag.get(UPSTREAM)}`, async () => {
    await createOrderMainPage.clickEmoSubmit('bad');
    await createOrderMainPage.confirmSubmit(true);
    await driver.sleep(3000); // wait for element not working, will revisit once SPECTRAUI-18092 is resolved
    await createOrderMainPage.clickCloseDrawer();

  });

  it(`Search for saved order and should find the result in the list ${Tag.get(UPSTREAM)}`, async () => {
    await driver.sleep(5000); // search is getting delayed hences added temporarily
    await welcomePage.navigateToInventoryDetailPage(InventoryDetailPage); // False navigation as it take some time for the order to change into processing status
    await driver.sleep(5000);// search is getting delayed hences added temporarily
    await welcomePage.navigateToManagerOrderPage(CreateOrderMainPage);
    await createOrderMainPage.addFilter('Processing');
    await createOrderMainPage.addFilter(savedOrderID);
    const numOfResults: string = await createOrderMainPage.getNumOfResults(`Fod_SearchDraft_${browser}`);
    expect(numOfResults).to.equal('1');
  });

  it(`Invoke View Customer from a record and Item Overview page should load fine ${Tag.get(UPSTREAM)}`, async () => {
    submitOrder = await createOrderMainPage.getListItemData(0, 1);
    const orderIndex: string = submitOrder.substring(submitOrder.lastIndexOf('F') + 1);
    await createOrderMainPage.triggerOrderAction(orderIndex, 'view-customer', `Fod_ViewCustomer_${browser}`);
    viewCustomerOrder =  new ViewCustomerOrder(driver);
    const title: string = await viewCustomerOrder.getItemTitle();
    expect(title).not.equal(null);
  });

  it(`Invoke View Order and verify the order id is same ${Tag.get(UPSTREAM)}`, async () => {
    viewCustomerOrder = new ViewCustomerOrder(driver);
    const itemID: string = await viewCustomerOrder.getListItemId('Processing');
    await viewCustomerOrder.triggerCustomOrderAction(itemID, 'view-order', `Fod_ViewOrderForCustomer_${browser}`);
    //await driver.sleep(4000);
    let orderIdOnScreen = (await viewCustomerOrder.getOrderTitle()).replace('Order ', '');
    expect(orderIdOnScreen).to.equal(savedOrderID);
  });


//   // Blocked  with SPECTRAUI-18092
//   it.skip(`Click Submit button and warning dialog pops up successfully ${Tag.get(UPSTREAM)}`, async () => {
//     await editOrderDetailPage.clickOnSubmitButton(`Fod_SubmitOrder_${browser}`);
//     const title: string = await createOrderMainPage.getPageTitle();
//     expect(title).to.include(Config.EDIT_ORDER_PAGE_TITLE);
//   });
// // Blocked  with SPECTRAUI-18092
//   it.skip(`Click Cancel and order is not submitted ${Tag.get(UPSTREAM)}`, async () => {
//     await editOrderDetailPage.confirmSubmit(false);
//     const title: string = await createOrderMainPage.getPageTitle();
//     expect(title).to.include(Config.EDIT_ORDER_PAGE_TITLE);
//   });

//  // Blocked  with SPECTRAUI-18092
//   it.skip(`Click Submit and warning dialog pops up successfully again ${Tag.get(UPSTREAM)}`, async () => {
//     await editOrderDetailPage.clickOnSubmitButton();
//     const title: string = await createOrderMainPage.getPageTitle();
//     expect(title).to.include(Config.EDIT_ORDER_PAGE_TITLE);
//   });
// // Blocked  with SPECTRAUI-18092
//   it.skip(`Click Yes and order is successfully submitted ${Tag.get(UPSTREAM)}`, async () => {
//     await editOrderDetailPage.confirmSubmit(true);
//     const message: string = await createOrderMainPage.getMessageText(`Fod_SubmitOrder_${browser}`);
//     if (message!=null) {
//       expect(message).to.contains('Number');
//     }
//     const title: string = await createOrderMainPage.getPageTitle();
//     expect(title).to.include(Config.MANAGE_ORDERS_PAGE_TITLE);
//   });
// // Blocked  with SPECTRAUI-18092
//   it.skip(`Search for submitted order and verify it's displayed in the list ${Tag.get(UPSTREAM)}`, async () => {
//     await createOrderMainPage.addFilter('Processing', `Fod_SearchSubmittedOrder_${browser}`);
//     const numOfResults: string = await createOrderMainPage.getNumOfResults();
//     expect(numOfResults).to.not.equal('0');
//   });
// // Blocked  with SPECTRAUI-18092
//   it.skip(`Invoke View action for the submitted order ${Tag.get(UPSTREAM)}`, async () => {
//     submitOrder = await createOrderMainPage.getListItemData(0, 1);
//     const orderIndex: string = submitOrder.substring(submitOrder.lastIndexOf('F') + 1);
//     await createOrderMainPage.triggerOrderAction(orderIndex, 'view-order', `Fod_ViewSubmittedOrder_${browser}`);
//     const viewOrderID: string = await editOrderDetailPage.getPageSubtitle(true);
//     expect(viewOrderID).to.contains(submitOrder);
//   });
// // Blocked  with SPECTRAUI-18092
//   it.skip(`Navigate back should return to manage-order page ${Tag.get(UPSTREAM)}`, async () => {
//     await editOrderDetailPage.goBack();
//     const listRowData: any = await createOrderMainPage.getListRowData(1);
//     expect(listRowData).to.not.equal(null);
//   });
// // Blocked  with SPECTRAUI-18092
//   it.skip(`Search for Customer and verify matching records are displayed the list ${Tag.get(UPSTREAM)}`, async () => {
//     await createOrderMainPage.addFilter('Processing', `Fod_SearchSubmittedOrder_${browser}`);
//     const numOfResults: string = await createOrderMainPage.getNumOfResults();
//     expect(numOfResults).to.not.equal('0');
//   });
// // Blocked  with SPECTRAUI-18092
//   it.skip(`Invoke View Customer from a record and Item Overview page should load fine ${Tag.get(UPSTREAM)}`, async () => {
//     submitOrder = await createOrderMainPage.getListItemData(0, 1);
//     const orderIndex: string = submitOrder.substring(submitOrder.lastIndexOf('F') + 1);
//     await createOrderMainPage.triggerOrderAction(orderIndex, 'view-customer', `Fod_ViewCustomer_${browser}`);
//     viewCustomerOrder = await new ViewCustomerOrder(driver);
//     const title: string = await viewCustomerOrder.getItemTitle();
//     expect(title).not.equal(null);
//   });
// // Blocked  with SPECTRAUI-18092
//   it.skip(`Invoke View Order from a Processing order and View Order page should open fine ${Tag.get(UPSTREAM)}`, async () => {
//     const itemID: string = await viewCustomerOrder.getListItemId('Processing');
//     await viewCustomerOrder.triggerCustomOrderAction(itemID, 'view-order', `Fod_ViewOrderForCustomer_${browser}`);
//   });

  after(async () => {
    if (isDIT) {
      await AppUtil.logout(driver, PageType.JET);
    }
    dm.releaseDriver(driver);
  });
});