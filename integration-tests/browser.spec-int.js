import { test } from '@playwright/test';
import { testDataStates } from './utils/states-with-fixtures';
import { DashboardPage } from './DashboardPage';
import { toggleFlows } from './utils/common-flows';
import { forwardConsole } from './helpers';

test.describe('initial page data', () => {
    test('should fetch initial data', async ({ page }) => {
        const dash = await DashboardPage.browser(page, testDataStates.protectionsOn);
        await dash.showsPrimaryScreen();
        await dash.mocks.calledForInitialExtensionMessage();
    });
});

test.describe('breakage form', () => {
    test('shows breakage form on category selection screen only', async ({ page }) => {
        /** @type {DashboardPage} */
        const dash = await DashboardPage.browser(page, testDataStates.google, { screen: 'breakageForm' });
        await dash.showsCategoryTypeSelectionForExtension();
    });

    test('navigates through categories to breakage form', { tag: '@screenshots' }, async ({ page }) => {
        /** @type {DashboardPage} */
        const dash = await DashboardPage.browser(page, testDataStates.google, {
            screen: 'breakageForm',
            randomisedCategories: 'false',
        });
        await dash.reducedMotion();
        await dash.screenshot('category-type-selection.png');
        await dash.selectsCategoryType('The site is not working as expected', 'notWorking');
        await dash.screenshot('category-selection.png');
        await dash.selectsCategory('Site layout broken', 'layout');
        await dash.breakageFormIsVisible();
        await dash.descriptionPromptIsVisible();
        await dash.screenshot('screen-breakage-form.png');
        await dash.submitFeedbackForm();
        await dash.mocks.calledForSubmitBreakageForm({ category: 'layout', description: '' });
    });

    test('other category is at the end of list', async ({ page }) => {
        /** @type {DashboardPage} */
        const dash = await DashboardPage.browser(page, testDataStates.google, {
            screen: 'breakageForm',
            randomisedCategories: 'true',
        });
        await dash.reducedMotion();
        await dash.selectsCategoryType('The site is not working as expected', 'notWorking');
        await dash.categoryIsLast('Something else');
    });

    test('hides description prompt on "dislike" category', { tag: '@screenshots' }, async ({ page }) => {
        /** @type {DashboardPage} */
        const dash = await DashboardPage.browser(page, testDataStates.google, {
            screen: 'breakageForm',
            randomisedCategories: 'false',
        });
        await dash.reducedMotion();
        await dash.selectsCategoryType('I dislike the content on this site', 'dislike');
        await dash.breakageFormIsVisible('I dislike the content');
        await dash.descriptionPromptIsNotVisible();
        await dash.screenshot('category-type-dislike.png');
    });

    test('skips to breakage form when disliked', async ({ page }) => {
        /** @type {DashboardPage} */
        const dash = await DashboardPage.browser(page, testDataStates.google, { screen: 'breakageForm' });
        await dash.reducedMotion();
        await dash.showsCategoryTypeSelectionForExtension();
        await dash.skipsToBreakageFormWhenDisliked();
    });

    test('shows empty description warning', { tag: '@screenshots' }, async ({ page }) => {
        /** @type {DashboardPage} */
        const dash = await DashboardPage.browser(page, testDataStates.google, { screen: 'breakageForm' });
        await dash.reducedMotion();
        await dash.selectsCategoryType('The site is not working as expected', 'notWorking');
        await dash.selectsCategory('Something else', 'other');
        await dash.breakageFormIsVisible();
        await dash.submitEmptyFeedbackForm();
        await dash.emptyDescriptionWarningIsVisible();
        await dash.screenshot('screen-breakage-form-empty-description.png');
    });

    test('submits form with description', { tag: '@screenshots' }, async ({ page }) => {
        /** @type {DashboardPage} */
        const dash = await DashboardPage.browser(page, testDataStates.google, { screen: 'breakageForm' });
        await dash.reducedMotion();
        await dash.selectsCategoryType('The site is not working as expected', 'notWorking');
        await dash.selectsCategory('Something else', 'other');
        await dash.breakageFormIsVisible();
        await dash.submitOtherFeedbackFormWithDescription('something happened');
        await dash.screenshot('screen-breakage-form-success.png');
    });

    test('goes back to primary screen from success screen', async ({ page }) => {
        /** @type {DashboardPage} */
        const dash = await DashboardPage.browser(page, testDataStates.google, { opener: 'dashboard' });
        await dash.reducedMotion();
        await dash.clicksWebsiteNotWorking();
        await dash.selectsCategoryType('The site is not working as expected', 'notWorking');
        await dash.selectsCategory('Site layout broken', 'layout');
        await dash.submitFeedbackForm();
        await dash.showsBreakageFormSuccessScreen();
        await dash.nav.goesBackToPrimaryScreenFromSuccessScreen();
    });

    test('hides back button in success screen when invoked from menu', async ({ page }) => {
        /** @type {DashboardPage} */
        const dash = await DashboardPage.browser(page, testDataStates.google, { opener: 'menu' });
        await dash.reducedMotion();
        await dash.clicksWebsiteNotWorking();
        await dash.selectsCategoryType('The site is not working as expected', 'notWorking');
        await dash.selectsCategory('Site layout broken', 'layout');
        await dash.submitFeedbackForm();
        await dash.showsBreakageFormSuccessScreen();
        await dash.showsNoButtonsInSuccessScreen();
    });
});

test.describe('opens directly to feedback form', () => {
    test('shows category from previous interaction', async ({ page }) => {
        const dash = await DashboardPage.browser(page, testDataStates.google, { screen: 'breakageFormFinalStep', category: 'videos' });
        await dash.reducedMotion();
        await dash.submitsVideoFeedbackFormWhenOpenedDirectly();
    });
    test('requires description when category is "Other"', async ({ page }) => {
        const dash = await DashboardPage.browser(page, testDataStates.google, { screen: 'breakageFormFinalStep', category: 'other' });
        await dash.reducedMotion();
        await dash.submitsOtherFeedbackFormWhenOpenedDirectly();
    });
});

test.describe('stack based router', () => {
    test('goes back and forward in categorySelection flow', async ({ page }) => {
        const dash = await DashboardPage.browser(page, testDataStates.google);
        // await dash.reducedMotion(); // TODO: Removed because back button was going back two steps rather than one
        await dash.clicksWebsiteNotWorking();
        await dash.waitForRouterToSettle();
        await dash.selectsCategoryType('The site is not working as expected', 'notWorking');
        await dash.waitForRouterToSettle();
        await dash.selectsCategory('Site layout broken', 'layout');
        await dash.waitForRouterToSettle();
        await dash.nav.goesBackToPrimaryScreenFromBreakageScreen();
    });
    test('goes back and forward generally', async ({ page }) => {
        const dash = await DashboardPage.browser(page, testDataStates.google);
        await dash.reducedMotion();
        await dash.clicksWebsiteNotWorking();
        await dash.showsCategoryTypeSelectionForExtension();

        // needed to allow the router to settle
        // playwright is too fast here and is doing something a user never could
        await page.waitForTimeout(100);
        await page.goBack();
        await dash.showsPrimaryScreen();

        // same as previous wait point
        await page.waitForTimeout(100);
        await page.goForward();
        await dash.showsCategoryTypeSelectionForExtension();
    });
});

test.describe('Protections toggle', () => {
    toggleFlows((page, params) => DashboardPage.browser(page, params));
});

test.describe('Protections toggle (extension specific)', () => {
    test('then pressing the toggle re-enables protections (overriding our decision)', async ({ page }) => {
        const dash = await DashboardPage.browser(page, testDataStates.protectionsOff);
        await dash.reducedMotion();
        await dash.toggleProtectionsOn();
        await dash.mocks.calledForToggleAllowList('protections-on-override');
    });
});

test.describe('Protections toggle -> simple report screen', () => {
    test('shows toggle report + accepts it', async ({ page }) => {
        forwardConsole(page);
        const dash = await DashboardPage.browser(page, testDataStates.protectionsOn);
        await dash.reducedMotion();
        await dash.showsPrimaryScreen();
        await dash.toggleProtectionsOff();
        await dash.mocks.calledForToggleAllowList();
        await dash.extension.triggersToggleReport();
        await dash.showsInformation();
        await dash.sendToggleReport();
    });
    test('handles disconnect + fetches new data for toggle-report', async ({ page }) => {
        forwardConsole(page);
        const dash = await DashboardPage.browser(page, testDataStates.protectionsOn);
        await dash.reducedMotion();
        await dash.showsPrimaryScreen();
        await dash.toggleProtectionsOff();
        await dash.mocks.calledForToggleAllowList();
        await dash.extension.triggersToggleReport();
        await dash.extension.reconnects();

        await dash.sendToggleReport();
        await dash.extension.reconnectsOnThankyouScreen();
    });
    test('shows toggle report + rejects it', async ({ page }) => {
        forwardConsole(page);
        const dash = await DashboardPage.browser(page, testDataStates.protectionsOn);
        await dash.reducedMotion();
        await dash.showsPrimaryScreen();
        await dash.toggleProtectionsOff();
        await dash.mocks.calledForToggleAllowList();
        await dash.extension.triggersToggleReport();
        await dash.rejectToggleReport();
    });
});

test.describe('special page (cta)', () => {
    test('should render correctly', async ({ page }) => {
        const dash = await DashboardPage.browser(page, testDataStates['special-page']);
        await dash.showingCTA();
    });
});

test.describe('search', () => {
    test('should not lose text when re-render occurs', async ({ page }) => {
        const dash = await DashboardPage.browser(page, testDataStates.protectionsOn);
        const term = 'nike';
        await dash.enterSearchText(term);
        await dash.addState([testDataStates.protectionsOn_blocked]);
        await dash.searchContainsText(term);
        await dash.submitSearch();
        await dash.mocks.calledForSearch(term);
    });
});

test.describe('options', () => {
    test('should open options page', async ({ page }) => {
        const dash = await DashboardPage.browser(page, testDataStates.protectionsOn);
        await dash.selectOptionsCog();
        await dash.mocks.calledForOptions();
    });
});

test.describe('tab data error', () => {
    test('should show an error screen', async ({ page }) => {
        const dash = await DashboardPage.browser(page, testDataStates['invalid-data']);
        await dash.displayingError();
    });
});

test.describe('localization', () => {
    test('should load with `pl` locale', async ({ page }) => {
        const dash = await DashboardPage.browser(page, testDataStates['locale-pl']);
        await dash.hasPolishLinkTextForConnectionInfo();
    });
});

test.describe('fire button', () => {
    test('by default no fire button is displayed', async ({ page }) => {
        const dash = await DashboardPage.browser(page, testDataStates['fire-button-disabled']);
        await dash.showsPrimaryScreen();
        await dash.fireButtonDoesntShow();
    });

    test('adding firebutton option to dashboard message shows fire button', async ({ page }) => {
        const dash = await DashboardPage.browser(page, testDataStates['fire-button-enabled']);
        await dash.fireButtonShows();
    });

    test('fire button menu: open and close', async ({ page }) => {
        const dash = await DashboardPage.browser(page, testDataStates['fire-button-no-pinned']);
        await dash.clickFireButton();
        await dash.fireButtonCancelClosesDialog();
    });
    test('fire button menu: history and tab clearing enabled', async ({ page }) => {
        const mock = testDataStates['fire-button-no-pinned'];
        const dash = await DashboardPage.browser(page, mock);
        await dash.clickFireButton();
        await dash.fireDialogIsPopulatedFromOptions(mock.toBurnOptions());
    });
    test('fire button menu: history clearing enabled', async ({ page }) => {
        const dash = await DashboardPage.browser(page, testDataStates['fire-button-tab-clear-disabled']);
        await dash.clickFireButton();
        await dash.fireDialogHistoryDisabled();
    });
    test('fire button menu: sends option parameters with burn message', async ({ page }) => {
        const mock = testDataStates['fire-button-no-pinned'];
        const dash = await DashboardPage.browser(page, mock);
        await dash.clickFireButton();
        await dash.clickFireButtonBurn();
        await dash.sendsOptionsWithBurnMessage(mock.toBurnOptions()?.options[0].options);
    });
    test('fire button menu: sends option parameters of selected burn option', async ({ page }) => {
        const mock = testDataStates['fire-button-no-pinned'];
        const dash = await DashboardPage.browser(page, mock);
        const [messages] = await dash.addState([mock]);
        await dash.clickFireButton();
        await dash.chooseBurnOption(1);
        await dash.clickFireButtonBurn();
        await dash.sendsOptionsWithBurnMessage(messages.getBurnOptions.options[1].options);
    });
});

test.describe('screenshots', { tag: '@screenshots' }, () => {
    const states = [
        { name: 'ad-attribution', state: testDataStates['ad-attribution'] },
        { name: 'new-entities', state: testDataStates['new-entities'] },
        // { name: 'upgraded+secure', state: testDataStates['upgraded+secure'] },
        { name: 'google-off', state: testDataStates['google-off'] },
        { name: 'cnn', state: testDataStates.cnn },
        {
            name: 'fire-button',
            state: testDataStates['fire-button'],
        },
    ];
    for (const { name, state } of states) {
        test(name, async ({ page }) => {
            const dash = await DashboardPage.browser(page, state);
            await dash.reducedMotion();
            await dash.screenshotEachScreenForState(name, state, { skipInCI: true });
        });
    }
});
