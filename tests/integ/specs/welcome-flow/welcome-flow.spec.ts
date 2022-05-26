import ojwd, { DriverManager as dm } from "@oracle/oraclejet-webdriver";
import { expect } from "chai";
import { WebDriver } from "selenium-webdriver";
import { WelcomePage } from "../../page-objects/welcome.po";
import { Config } from "../../util/Config";
import { EditOrderDetailPage } from "../../page-objects/edit-order-detail.po";
import { AppUtil } from "@taui/fa-common-lib/lib/utilities/app-util/app-util";
import { PageType } from "@taui/fa-common-lib/lib/page/page-type";
import { BrowserUtil } from "@taui/fa-common-lib/lib/utilities/browser/browser-util";
import { Tag, UPSTREAM } from "@taui/fa-common-lib/lib//utilities/tag";

let isDIT: boolean = false;
let url: string;

describe("Welcome Page Flow test", () => {
  let driver: WebDriver;
  let welcomePage: WelcomePage;
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

  it(`Initial Load Welcome page should succeed ${Tag.get(
    UPSTREAM
  )}`, async () => {
    welcomePage = new WelcomePage(driver);
    const title: string = await welcomePage.getPageTitle(isDIT);
    expect(title).to.include(Config.WELCOME_PAGE_TITLE);
  });

  it(`Checking if Title from Welcome Page Template Component is loaded ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const banner: string = await welcomePage.getHeaderWelcomeBanner();
    expect(banner).to.equals("Welcome to the Redwood Reference App");
  });

  it(`Checking if Description Text from Welcome Page Template Component is loaded ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const descriptionTxt: string =
      await welcomePage.getDescriptionWelcomeBanner();
    expect(descriptionTxt).to.contain(
      "Create and submit orders and review information about inventory."
    );
  });

  it(`Verify Order Number from Object Card is loaded and displayed with data ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const orderNumber: string = await welcomePage.getOrderNumberObjectCard();
    expect(orderNumber).to.contain("F");
  });

  it(`Verify Customer Name from Object Card is loaded and displayed with data ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const customerName: string = await welcomePage.getCustomerNameObjectCard();
    expect(customerName.length).to.be.greaterThan(5);
  });

  it(`Verify Order Status from Object Card is loaded and displayed with data ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const orderStatus: string = await welcomePage.getOrderStatusObjectCard();
    expect(orderStatus).to.equals("Draft");
  });

  it(`Verify Amount from Object Card is loaded and displayed with data ${Tag.get(
    UPSTREAM
  )}`, async () => {
    const amountTxt: string = await welcomePage.getAmountObjectCard();
    expect(amountTxt).to.include("$");
  });

  it(`Click Edit Order button should navigate to Edit Order page ${Tag.get(
    UPSTREAM
  )}`, async () => {
    let editOrderDetailPage: EditOrderDetailPage =
      await welcomePage.navigateToEditOrderPage(`RRA_InitialEdit_${browser}`);
    const title: string = await editOrderDetailPage.getPageTitle();
    expect(title).to.include(Config.EDIT_ORDER_PAGE_TITLE);
  });
  after(async () => {
    if (isDIT) {
      await AppUtil.logout(driver, PageType.JET);
    }
    dm.releaseDriver(driver);
  });
});
