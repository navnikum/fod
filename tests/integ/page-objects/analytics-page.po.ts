import { By, WebDriver, WebElement, WebElementPromise } from 'selenium-webdriver';
import { BasePage } from '@taui/fa-common-lib/lib/page/base-page';
import { PageType } from '@taui/fa-common-lib/lib/page/page-type';


const LOCATORS: any = {
    DASHBOARD_PAGE_TITLE_ID: By.id('oj-sp-dashboard-page-1_pageTitle'),
    SCORE_CARD_LOC_STRING: `li.oj-listview-item-element.oj-listview-card:nth-child(cardIndex)`,
    PANEL_TITLE_LOC_STRING: `(//span[contains(@class,'oj-sp-dashboard-panel-title')])[panelIndex]`
};

export class AnalyticsPage extends BasePage {

    constructor(driver: WebDriver) {
        super(driver, PageType.JET);
        this.driver = driver;
    }

    public async getPageTitle(isDIT?: boolean): Promise<string> {
        return this.driver.getTitle();
    }

    public async getDashboardPageTitle(): Promise<string> {
        return this.driver.findElement(LOCATORS.DASHBOARD_PAGE_TITLE_ID).getText();
    }

    public async getScoreCard(cardNumber: string): Promise<WebElement> {
        const cardLocator = LOCATORS.SCORE_CARD_LOC_STRING.replace('cardIndex', cardNumber);
        return this.driver.findElement(By.css(cardLocator));
    }

    public async getScoreCardDetails(cardNumber: string): Promise<string> {
        return await this.getScoreCard(cardNumber).then((cardelement) => {
            return cardelement.getText();
        });
    }

    public async clickScoreCard(cardNumber: string): Promise<any> {
        return await this.getScoreCard(cardNumber).then((cardelement) => {
            return cardelement.click();
        })
    }

    public async getPanelTitle(panelNumber: string): Promise<string> {
        const panelLocator = LOCATORS.PANEL_TITLE_LOC_STRING.replace('panelIndex', panelNumber);
        return this.driver.findElement(By.xpath(panelLocator)).getText();
    }

    public async getPanelTitles(panelNumbers: string[]): Promise<string[]> {
        let panelTitles: string[] = [];
        for (let i = 0; i < panelNumbers.length; i++) {
            const panelTitle = await this.getPanelTitle(panelNumbers[i]);
            panelTitles.push(panelTitle);
        }
        return panelTitles;
    }

}  