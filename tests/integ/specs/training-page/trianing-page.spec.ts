import 'mocha';
import ojwd, {DriverManager as dm} from '@oracle/oraclejet-webdriver';
import {expect} from 'chai';
import {WebDriver} from 'selenium-webdriver';
import {WelcomePage} from '../../page-objects/welcome.po';
import {TrainingPage} from '../../page-objects/training-page-main.po';
import {Config} from '../../util/Config';
import {AppUtil} from '@taui/fa-common-lib/lib/utilities/app-util/app-util';
import {PageType} from '@taui/fa-common-lib/lib/page/page-type';
import {BrowserUtil} from '@taui/fa-common-lib/lib/utilities/browser/browser-util';
import {Tag, UPSTREAM} from '@taui/fa-common-lib/lib//utilities/tag';

let isDIT: boolean = false;
let url: string;


describe(`Training flow`, () => {
  let driver: WebDriver;
  let welcomePage: WelcomePage;
  let trainingPage : TrainingPage ;

  const browser: string = process.env.browser as string;
  before(async () => {
    driver = await dm.getDriver('test');
  BrowserUtil.setWindowMaxSize(driver);
    url = process.env.baseURL as string;
    if (url.startsWith('https://') && url.includes('fscmUI')) {
      isDIT = true;
    }

  // await resetData();

  });

  it(`Login DIT environment with specified user account should be successful ${Tag.get(UPSTREAM)}`, async () => {
    if (isDIT) {
     await AppUtil.login(driver, url, Config.ADMIN_USERNAME, Config.ADMIN_PWD, PageType.JET, WelcomePage);
    } else {
      ojwd.get(driver, url);
    }
  });

  it(`Initial Load RRA page and navigate to training page ${Tag.get(UPSTREAM)}`, async () => {
    welcomePage = new WelcomePage(driver);
    trainingPage = await welcomePage.navigateToTrainingPage(TrainingPage, `RRA_TraingPage_${browser}`);
    const title: string = await trainingPage.getPageTitle(isDIT);
    expect(title).to.include(Config.TRAINING_PAGE_TITLE);
  });

  it(`Verify training list is loaded and displayed with data ${Tag.get(UPSTREAM)}`, async () => {
    const listRowData: any = await trainingPage.getTrainingListRowData();
    expect(listRowData).to.not.equal(null);
  });

  it(`Verify that the card contains the primary text as Product Recall Announcement ${Tag.get(UPSTREAM)}`, async () => {

    const cardPrimaryText: string = await trainingPage.cardData('0');
    expect(cardPrimaryText).to.contains('Product Recall Announcement');
  });

  // Reset function is not working in the local host hence skippd
  it.skip(`Verify that the badges status is pending   ${Tag.get(UPSTREAM)}`, async () => {
    expect(await trainingPage.getBadgeStatus(0)).to.equal('Pending');
  });

  it(`Click the training card and verify user navigates to correct page ${Tag.get(UPSTREAM)}`, async () => {
    await trainingPage.clickOnTheCard('0');
   expect(await trainingPage.getHeadingTitle()).to.equal('Product Recall Announcement');
  });

  it(`Verify that the number of task completed is correct ${Tag.get(UPSTREAM)}`, async () => {
    let taskCount = 0 ;
    let taskCountOnScreen = await trainingPage.getCompletedTaskTextOnScreen();
     taskCount = ( taskCountOnScreen
  .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [] )
  .map(function (v) {return +v;}).shift();
    for (let i = 1; i < 5; ++i) {
      await trainingPage.openCollapsible(`task_${i}_collapsible1`, `RRA_TraingDetail_${browser}`);
      const enabled = await trainingPage.isEnabledCheck(i);
      if (enabled) {
        await trainingPage.clickDone(i);
        ++taskCount;
      }
    }
    taskCountOnScreen = await trainingPage.getCompletedTaskTextOnScreen();
    expect(taskCountOnScreen).to.equal(`${taskCount} of 4 tasks completed`)
  });

  // Defect - SPECTRAUI-20636
  it.skip (`Verify that the badges of the card changes to complete  ${Tag.get(UPSTREAM)}`, async () => {
     await welcomePage.navigateToTrainingPage(TrainingPage, `RRA_TraingPage_${browser}`);
     expect(await trainingPage.getBadgeStatus(0)).to.equal('Completed');
  });

  after(async () => {
    if (isDIT) {
      await AppUtil.logout(driver, PageType.JET);
    }
    dm.releaseDriver(driver);
  });
});