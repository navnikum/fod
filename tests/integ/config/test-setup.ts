import { ScreenShotUtil } from '@taui/fa-common-lib/lib/utilities/screen-shot/screen-shot-util';
import { DriverUtil } from '@taui/fa-common-lib/lib/utilities/driver/driver-util';
import { CommandLineUtil } from '@taui/fa-common-lib/lib/utilities/command-line/command-line-util';
import { ICommandLine } from '@taui/fa-common-lib/lib/utilities/command-line/icommand-line';
import { HoverflyUtil } from '@taui/fa-common-lib/lib/utilities/hoverfly/hoverfly-util';
import { LogUtil } from '@taui/fa-common-lib/lib/utilities/logger/log-util';
import { TimeTracker } from '@taui/fa-common-lib/lib/utilities/time-tracker';
import { Configure } from '@taui/fa-common-lib/lib/utilities/configure';
import { Tag } from '@taui/fa-common-lib/lib//utilities/tag';
import {ChromeBrowserOptionEx} from "../util/chrome-browser-option-ex";

// for windows, we need to explicity add the dependency so we need to disable lint rule
// tslint:disable-next-line: no-var-requires
const addContext: any = require('mochawesome/addContext');
// tslint:disable-next-line: no-var-requires

require('chromedriver'); //comment this line, if there chromedriver is locally intalled
const configuration: Configure = Configure.parseConfiguration("./tests/integ/config/test-configuration.json");

process.env.baseURL = configuration.baseURL;
process.env.browser = configuration.browser; // Default is chrome
HoverflyUtil.init(configuration);
ScreenShotUtil.init(configuration.screenShotDir);
LogUtil.init(configuration.logDir);
Tag.init(configuration.tagConfigFile);

/**
 * Global hook handling before each test.
 */
beforeEach(async function (): Promise<void> {
  ScreenShotUtil.createTestSuiteFolder(this.currentTest);
  ScreenShotUtil.createTestFolder(this.currentTest);

  LogUtil.autoInfoLog("Start " + this.currentTest.title);
  TimeTracker.startTracking(this.currentTest.title);
  if ((HoverflyUtil.level === 'test' || (HoverflyUtil.level === 'suite' && this.currentTest.id == this.currentTest.parent.tests[0].id))
    && HoverflyUtil.usehoverfly && HoverflyUtil.isSimulating()) {
    await HoverflyUtil.importSimulationData(this.currentTest);
  }
});

/**
 * Global hook handling each test, generating screenshot when that test fails as
 * <test folder>/screenshotFolder/<suite name>/testname_AT_timestamp.jpeg
 */
afterEach('take screenshot on failure', async function (): Promise<void> {
  if (this.currentTest.state != 'passed') {
    const imageWithRelativePath: string = await ScreenShotUtil.takeScreenShot(this.currentTest);
    addContext(this, imageWithRelativePath);

    LogUtil.autoErrorLog("Failed " + this.currentTest.title);
  } else {

    LogUtil.autoInfoLog("Ended " + this.currentTest.title);
    TimeTracker.endTracking(this.currentTest.title);

    ScreenShotUtil.cleanTestFolder(this.currentTest);
    ScreenShotUtil.cleanTestSuiteFolder( this.currentTest);
  }

  if ((HoverflyUtil.level === 'test' || (HoverflyUtil.level === 'suite' &&
      this.currentTest.id == this.currentTest.parent.tests[this.currentTest.parent.tests.length-1].id))
    && HoverflyUtil.usehoverfly && HoverflyUtil.isCapturing()) {
    await HoverflyUtil.exportCapturedData(this.currentTest);
  }

});
before(async function (): Promise<void> {
  const commandLine: ICommandLine = CommandLineUtil.parse();
  DriverUtil.registerBrowser(ChromeBrowserOptionEx, 'chrome');
  DriverUtil.configure(commandLine, configuration.gat);
  if (commandLine.getOptionValue('hoverfly')) {
    HoverflyUtil.mode = commandLine.getOptionValue("hoverflyMode") as string || HoverflyUtil.mode;
    HoverflyUtil.usehoverfly = true;
    await HoverflyUtil.startHoverfly();
  }

  if (HoverflyUtil.level === 'root' && HoverflyUtil.usehoverfly && HoverflyUtil.isSimulating()) {
    await HoverflyUtil.importSimulationData(null);
  }
});

after('Tear Down', async () => {

  if (HoverflyUtil.level === 'root' && HoverflyUtil.usehoverfly == true && HoverflyUtil.isCapturing()) {
    await HoverflyUtil.exportCapturedData(null);
  }

  if (HoverflyUtil.usehoverfly && HoverflyUtil) {
    await HoverflyUtil.shutDownHoverfly();
  }
});



