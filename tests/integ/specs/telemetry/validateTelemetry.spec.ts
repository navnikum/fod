import * as wd from "telemetry-webdriver";
import { WebDriver } from "selenium-webdriver";
import { expect } from "chai";
import ojwd, { DriverManager as dm } from "@oracle/oraclejet-webdriver";
import { WelcomePage } from "../../page-objects/welcome.po";
import { CreateOrderMainPage } from "../../page-objects/create-order-main.po";
import { Config } from "../../util/Config";
import { AppUtil } from "@taui/fa-common-lib/lib/utilities/app-util/app-util";
import { PageType } from "@taui/fa-common-lib/lib/page/page-type";
import { BrowserUtil } from "@taui/fa-common-lib/lib/utilities/browser/browser-util";
import { Tag, UPSTREAM } from "@taui/fa-common-lib/lib//utilities/tag";

let isDIT: boolean = false;
let url: string;

describe("Telemetry TestSuite", () => {
  let driver: WebDriver;
  let welcomePage: WelcomePage;
  let createOrderMainPage: CreateOrderMainPage;
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

  it(`Verify that the telemetry is wired correctly${Tag.get(
    UPSTREAM
  )} `, async () => {
    expect(await wd.validateFusionTelemetryInit(driver)).to.equal(true);
  });

  it(`Verify that the session id is not null ${Tag.get(
    UPSTREAM
  )}`, async () => {
    let sessionId = await wd.getSessionId(driver);
    expect(sessionId).to.not.be.null;
  });

  after(async () => {
    if (isDIT) {
      await AppUtil.logout(driver, PageType.JET);
    }
    dm.releaseDriver(driver);
  });
});
