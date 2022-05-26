import 'mocha';
import ojwd, { DriverManager as dm } from '@oracle/oraclejet-webdriver';
import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { WelcomePage } from '../../page-objects/welcome.po';
import { Config } from '../../util/Config';
import { AppUtil } from '@taui/fa-common-lib/lib/utilities/app-util/app-util';
import { PageType } from '@taui/fa-common-lib/lib/page/page-type';
import { BrowserUtil } from '@taui/fa-common-lib/lib/utilities/browser/browser-util';
import { Tag, UPSTREAM } from '@taui/fa-common-lib/lib//utilities/tag';
import { AnalyticsPage } from '../../page-objects/analytics-page.po';


describe(`Analytics flow test`, () => {
    let driver: WebDriver;
    let welcomePage: WelcomePage;
    let analyticsPage: AnalyticsPage;
    let isDIT: boolean = false;
    let url: string;
    const browser: string = process.env.browser as string;

    const scoreBoardTitles = ['Total Order Amount', 'Total Items in Stock',
        'Total Quantity', 'Average Lead Time',
        'Number of Orders'];

    const orderOrQuantityPanelTitles = ['Order Amount: Top 5 Product Categories',
        'Total Amount by Order Date',
        'Ordered vs. In Stock'];

    const stockPanelTitles = ['Ordered Quantity vs. In Stock by Top 5 Product Categories',
        'Top 5 Product Categories by Quantity',
        'Items in Stock by Product Category'];


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

    it(`The user should be able to navigate to Analytics page successfully ${Tag.get(UPSTREAM)}`, async () => {
        welcomePage = new WelcomePage(driver);
        analyticsPage = await welcomePage.navigateToAnalyticsPage(AnalyticsPage, `RRA_AnalyticsPage_${browser}`);
        const title: string = await analyticsPage.getPageTitle(isDIT);
        expect(title).to.include(Config.ANALYTIC_PAGE_TITLE);
    });

    it(`The user should see the analytics dashboard page title ${Tag.get(UPSTREAM)}`, async () => {
        const title: string = await analyticsPage.getDashboardPageTitle();
        expect(title).to.include('Orders Analysis');
    });

    it(`The user should see order details on clicking the total order amount scoreboard card ${Tag.get(UPSTREAM)}`, async () => {
        const details: string = await analyticsPage.getScoreCardDetails("1");
        expect(details).to.include(scoreBoardTitles[0]);
        const actualPanelTitles: string[] = await analyticsPage.getPanelTitles(['1', '2', '3']);
        expect(orderOrQuantityPanelTitles).to.deep.equal(actualPanelTitles);
    });

    it(`The user should see stock details on clicking the total items in stock scoreboard card ${Tag.get(UPSTREAM)}`, async () => {
        await analyticsPage.clickScoreCard("2");
        const details: string = await analyticsPage.getScoreCardDetails("2");
        expect(details).to.include(scoreBoardTitles[1]);
        const actualPanelTitles: string[] = await analyticsPage.getPanelTitles(['4', '5', '6']);
        expect(stockPanelTitles).to.deep.equal(actualPanelTitles);
    });

    it(`The user should see quantity details on clicking the total quantity scoreboard card ${Tag.get(UPSTREAM)}`, async () => {
        await analyticsPage.clickScoreCard("3");
        const details: string = await analyticsPage.getScoreCardDetails("3");
        expect(details).to.include(scoreBoardTitles[2]);
        const actualPanelTitles: string[] = await analyticsPage.getPanelTitles(['1', '2', '3']);
        expect(orderOrQuantityPanelTitles).to.deep.equal(actualPanelTitles);
    });

    it(`The user should see lead time details on clicking the average lead time scoreboard card ${Tag.get(UPSTREAM)}`, async () => {
        await analyticsPage.clickScoreCard("4");
        const details: string = await analyticsPage.getScoreCardDetails("4");
        expect(details).to.include(scoreBoardTitles[3]);
    });

    it(`The user should see order details on clicking the number of orders scoreboard card ${Tag.get(UPSTREAM)}`, async () => {
        await analyticsPage.clickScoreCard("5");
        const details: string = await analyticsPage.getScoreCardDetails("5");
        expect(details).to.include(scoreBoardTitles[4]);
    });

    after(async () => {
        if (isDIT) {
            await AppUtil.logout(driver, PageType.JET);
        }
        dm.releaseDriver(driver);
    });

});