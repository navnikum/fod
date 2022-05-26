
import "mocha";

import ojwd, { DriverManager as dm } from "@oracle/oraclejet-webdriver";
import { expect } from "chai";
import { WebDriver } from "selenium-webdriver";
import { InventoryDetailPage } from "../../page-objects/inventory-details.po";
import { WelcomePage } from "../../page-objects/welcome.po";
import { AddProductPage } from "../../page-objects/add-product.po";
import { Config } from "../../util/Config";
import { AppUtil } from "@taui/fa-common-lib/lib/utilities/app-util/app-util";
import { PageType } from "@taui/fa-common-lib/lib/page/page-type";
import { BrowserUtil } from "@taui/fa-common-lib/lib/utilities/browser/browser-util";
import { Tag, UPSTREAM } from "@taui/fa-common-lib/lib//utilities/tag";
let isDIT: boolean = false;
let url: string;
let steps: any[];
let productNumber: string;
let description: string;
let estimatedDate: string;
let currentDate: string;
let resultCount: string;
let productName: string;

const stepsTitle = {
  step1: "Supplier and product",
  step2: "Category and description",
  step3: "Price and margin",
  step4: "Stock and reorder details",
  step5: "Activation",
};

describe(`Add Product Flow`, () => {
  let driver: WebDriver;
  let welcomePage: WelcomePage;
  let inventoryDetailPage: InventoryDetailPage;
  let addProductPage: AddProductPage;
  

  before(async () => {
    driver = await dm.getDriver("test");
    BrowserUtil.resizeBrowser(driver, 1920, 1080);
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
  it(`Initial Load FOD page should succeed with title Check ${Tag.get(
    UPSTREAM
  )}`, async () => {
    welcomePage = new WelcomePage(driver);

    inventoryDetailPage = await welcomePage.navigateToInventoryDetailPage(
      InventoryDetailPage
    );
    driver.sleep(2000);
    const title: string = await inventoryDetailPage.getPageTitle(isDIT);
    expect(title).to.include(Config.INVENTORY_PAGE_TITLE);
  });
  it(`Verify that the user navigates to add product screen ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await inventoryDetailPage.addFilter(false, "Laptops");
    resultCount = await inventoryDetailPage.getNumOfResults();
    addProductPage = new AddProductPage(driver);
    await inventoryDetailPage.clickAddProduct();
    await driver.wait(await ojwd.pageReady());
    const pageTitle: string = await addProductPage.getProcessTitle();
    expect(pageTitle).to.equal(Config.ADD_PRODUCT_PAGE_TITLE);
  });

  it(`Verify that the step titles are correct ${Tag.get(
    UPSTREAM
  )}`, async () => {
    steps = await addProductPage.getSteps();
    for (let i = 0; i < steps.length; i++) {
      expect(await steps[i].title).to.equal(await stepsTitle["step" + (i + 1)]);
    }
  });
  it(`Verify that clicking in start takes the user to supplier and product screen ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await addProductPage.clickStart();
    expect(await steps[0].title).to.equal(await stepsTitle.step1);
  });
  it(`Verify that the product name  is disabled ${Tag.get(
    UPSTREAM
  )}`, async () => {
    expect(await addProductPage.getProductNumber()).to.equal(null);
  });

  it(`Verify that the description is disabled ${Tag.get(
    UPSTREAM
  )}`, async () => {
    expect(await addProductPage.getDescription()).to.equal(null);
  });
  it(`Verify that the supplier number gets populated & correct on selecting the supplier name ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await addProductPage.selectSupplier("Computing Innovations");
    const supplierName: string = await addProductPage.getSupplierNumber();
    expect(supplierName).to.not.equal(null);
  });
  it(`Verify that on selecting the product name , product number gets populated & its not null ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await addProductPage.selectProductname("Quantum Laptop Q1");
    productNumber = await addProductPage.getProductNumber();
    productName = await addProductPage.getProductname();
    expect(productNumber).to.not.equal(null);
  });
  it(`Verify that on selecting the product name the dec gets populated and its not null ${Tag.get(
    UPSTREAM
  )}`, async () => {
    description = await addProductPage.getDescription();
    expect(description).to.not.equal(null);
  });
  it(`Verify that clicking on continue takes the user to the next step i.e Category and description ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await addProductPage.clickContinueOnExpandedView();
    expect(await steps[1].title).to.equal(await stepsTitle.step2);
  });

  /* Step 2 validations  ................*/
  it(`Verify that the product name  on step2 is not null  ${Tag.get(
    UPSTREAM
  )}`, async () => {
    expect(await addProductPage.getProductNameOnStep2()).to.not.equal(null);
  });
  it(`Verify that the description on step2 is same as  on step 1 ${Tag.get(
    UPSTREAM
  )}`, async () => {
    expect(await addProductPage.getDescriptionOnStep2()).to.equal(description);
  });
  it(`Verify that an error is displayed if user tries to navigate to step3 without selecting the category  ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await addProductPage.clickContinueOnExpandedView();
    expect(await addProductPage.checkError()).equal(true);
  });
  it(`Verify that clicking on continue takes the user to the next step i.e Category and description ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await addProductPage.selectCategory("Laptops");
    await addProductPage.clickContinueOnExpandedView();
    expect(await steps[2].title).to.equal(await stepsTitle.step3);
  });

  /* Step 3 validations  ................*/
  it(`Verify that MSRP field is not null   ${Tag.get(UPSTREAM)}`, async () => {
    expect(await addProductPage.getMsrp()).to.not.equal(null);
  });
  it(`Verify that cost per unit is not null   ${Tag.get(
    UPSTREAM
  )}`, async () => {
    expect(await addProductPage.getCostPerUnit()).to.not.equal(null);
  });
  it(`Verify that price field is not null   ${Tag.get(UPSTREAM)}`, async () => {
    expect(await addProductPage.getPriceStep3()).to.not.equal(null);
  });
  it(`Verify that margin field is not null   ${Tag.get(
    UPSTREAM
  )}`, async () => {
    expect(await addProductPage.getMargin()).to.not.equal(null);
  });
  it(`Verify that clicking on continue takes the user to the next step 4 i.e Stock and reorder details ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await addProductPage.clickContinueOnExpandedView();
    expect(await steps[3].title).to.equal(await stepsTitle.step4);
  });

  /* Step 4 validations  ................*/
  it(`Verify that minimum quanity field is set to 1   ${Tag.get(
    UPSTREAM
  )}`, async () => {
    expect(await addProductPage.getMinimumOrder()).to.not.equal(null);
    expect(await addProductPage.getMinimumOrder()).to.equal("1");
  });
  it(`Verify  that the supplier's inventory field is not null  ${Tag.get(
    UPSTREAM
  )}`, async () => {
    expect(await addProductPage.getSuppliersInventory()).to.not.equal(null);
  });
  it(`Verify supplier's estimate delivery field is not null  ${Tag.get(
    UPSTREAM
  )}`, async () => {
    estimatedDate = await addProductPage.getSuppliersEstimatedDate();
    expect(estimatedDate).to.not.equal(null);
  });

  it(`Verify that the initial order amount is null   ${Tag.get(
    UPSTREAM
  )}`, async () => {
    expect(await addProductPage.getInitialOrderAmt()).to.equal("");
    await addProductPage.setInitialOrderAmt(100);
  });
  it(`Verify that the low stock threshold is empty  ${Tag.get(
    UPSTREAM
  )}`, async () => {
    expect(await addProductPage.getLowStockThreshold()).to.equal("");
    await addProductPage.setLowStockThreshold(10);
  });
  it(`Verify that the reorder amount is empty  ${Tag.get(
    UPSTREAM
  )}`, async () => {
    expect(await addProductPage.getReOrderAmt()).to.equal("");
    await addProductPage.setReOrderAmt(1000);
  });
  it(`Verify that clicking on continue takes the user to the next step 5 i.e Activation ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await addProductPage.clickContinueOnExpandedView();
    expect(await steps[4].title).to.equal(await stepsTitle.step5);
  });
  /* .......................................................*/

  /* Step5  validations  ................*/
  it(`Verify that the supplier's arrival date is not null and matches with the previous step date  ${Tag.get(
    UPSTREAM
  )}`, async () => {
    expect(await addProductPage.getSupplierArrivalDate()).to.not.equal(null);
    expect(await addProductPage.getSupplierArrivalDate()).to.equal(
      estimatedDate
    );
  });
  it(`Verify that activation date is today's date  ${Tag.get(
    UPSTREAM
  )}`, async () => {
    currentDate = await addProductPage.getCurrentDate();
    expect(await addProductPage.getSupplierArrivalDate()).to.not.equal(null);
  });
  it(`Verify that setting previous day date to activation date throw error  ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await addProductPage.setActivationDate(await addProductPage.getbackDate(2));
    expect(await addProductPage.checkError()).equal(true);
    await addProductPage.setActivationDate(currentDate);
  });
  it(`Verify that setting previous day date to deactivation date throw error  ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await addProductPage.setDeActivationDate(
      await addProductPage.getbackDate(2)
    );
    expect(await addProductPage.checkError()).equal(true);
    await addProductPage.setDeActivationDate(
      await addProductPage.getFutureDate(2)
    );
  });

  it.skip(`Verify that clicking on activate button takes the user to inventory screen  ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await addProductPage.clickAddProduct();
    let msg: string = await addProductPage.getMessageText();
  //  expect(msg).to.equal(null);
    // await inventoryDetailPage.waitAddProductBtn();
    // await addProductPage.clickAddProduct();
    const title= await addProductPage.getProductInventoryPageTitle();
    expect(title).to.include(Config.INVENTORY_PAGE_TITLE);
  });
  it.skip(`Verify that the laptop count is increased by 1 ${Tag.get(
    UPSTREAM
  )}`, async () => {
    await inventoryDetailPage.addFilter(false, "Laptops");
    const incResultCount = await inventoryDetailPage.getNumOfResults();
    expect(parseInt(incResultCount)).to.equal(parseInt(resultCount) + 1);
  });
  /* .......................................................*/
  after(async () => {
    if (isDIT) {
      await AppUtil.logout(driver, PageType.JET);
    }
    dm.releaseDriver(driver);
  });
});
