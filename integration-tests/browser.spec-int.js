import { test as baseTest, expect } from '@playwright/test'
import { forwardConsole, withExtensionRequests } from './helpers'

const HTML = '/build/app/html/browser.html'

const test = baseTest.extend({
    extensionMessages: [
        async ({ page }, use) => {
            forwardConsole(page)
            await use()
        },
        // @ts-ignore
        { auto: true },
    ],
    extensionMocks: [
        async ({ page }, use) => {
            const requests = await withExtensionRequests(page, {
                tab: {
                    id: 1533,
                    url: 'https://example.com',
                    upgradedHttps: false,
                    protections: {
                        unprotectedTemporary: false,
                        enabledFeatures: ['contentBlocking'],
                        denylisted: false,
                        allowlisted: false,
                    },
                },
                requestData: { requests: [] },
                emailProtectionUserData: {
                    cohort: 'private_beta_dax',
                    nextAlias: '123456_next',
                    token: '123456',
                    userName: 'daxtheduck',
                },
            })
            await page.goto(HTML)
            await use(requests)
        },
        // @ts-ignore
        { auto: true },
    ],
})

test.describe('initial page data', () => {
    test('should fetch initial data', async ({ page, extensionMocks }) => {
        // @ts-ignore
        const out = await extensionMocks.outgoing({ names: [] })
        expect(out).toMatchObject([
            {
                messageType: 'getPrivacyDashboardData',
                options: { tabId: 0 },
            },
        ])
        // await page.pause()
        await page.locator('"No Tracking Requests Found"').waitFor({ timeout: 500 })
        await expect(page).toHaveScreenshot('no-requests.png')
    })
})

test.describe('breakage form', () => {
    test('should submit with no values', async ({ page, extensionMocks }) => {
        await page.locator('"Website not working as expected?"').click()
        await page.locator('"Send Report"').waitFor({ timeout: 600 })
        await expect(page).toHaveScreenshot('send-report.png')
        await page.locator('"Send Report"').click()
        // @ts-ignore
        const out = await extensionMocks.outgoing({
            names: ['submitBrokenSiteReport'],
        })
        expect(out).toMatchObject([
            {
                messageType: 'submitBrokenSiteReport',
                options: { category: '', description: '' },
            },
        ])
    })
    test('should submit with description', async ({ page, extensionMocks }) => {
        await page.locator('"Website not working as expected?"').click()
        await page.locator('textarea').type('Video not playing')
        await page.locator('"Send Report"').click()
        // @ts-ignore
        const out = await extensionMocks.outgoing({
            names: ['submitBrokenSiteReport'],
        })
        expect(out).toMatchObject([
            {
                messageType: 'submitBrokenSiteReport',
                options: { category: '', description: 'Video not playing' },
            },
        ])
    })
    test('should submit with category', async ({ page, extensionMocks }) => {
        await page.locator('"Website not working as expected?"').click()
        const optionToSelect = "Video didn't play"
        await page.locator('select').selectOption({ label: optionToSelect })
        await page.locator('"Send Report"').click()
        // @ts-ignore
        const out = await extensionMocks.outgoing({
            names: ['submitBrokenSiteReport'],
        })
        expect(out).toMatchObject([
            {
                messageType: 'submitBrokenSiteReport',
                options: { category: 'videos', description: '' },
            },
        ])
    })
})

test.describe('Protections toggle', () => {
    test.describe('when a site is NOT allowlisted', () => {
        test('then pressing toggle should disable protections', async ({ page, extensionMocks }) => {
            await page.locator('[aria-pressed="true"]').click()
            await page.waitForTimeout(1000)
            // @ts-ignore
            const out = await extensionMocks.outgoing({ names: ['setList'] })
            expect(out).toMatchObject([
                {
                    messageType: 'setList',
                    options: {
                        list: 'denylisted',
                        domain: 'example.com',
                        value: false,
                    },
                },
                {
                    messageType: 'setList',
                    options: {
                        list: 'allowlisted',
                        domain: 'example.com',
                        value: true, // <-- this turns off protections
                    },
                },
            ])
            // @ts-ignore
            const calls = await extensionMocks.calls()
            expect(calls).toMatchObject([
                ['reload', 1533],
                ['getViews', { type: 'popup' }],
                ['close', undefined],
            ])
        })
    })
    test.describe('When the site is already allowlisted', () => {
        test('then pressing the toggle re-enables protections', async ({ page }) => {
            const requests = await withExtensionRequests(page, {
                requestData: { requests: [] },
                tab: {
                    id: 1533,
                    url: 'https://example.com',
                    upgradedHttps: false,
                    protections: {
                        denylisted: false,
                        allowlisted: true,
                        enabledFeatures: ['contentBlocking'],
                        unprotectedTemporary: false,
                    },
                },
            })
            await page.goto(HTML)
            await page.locator('"No Tracking Requests Found"').waitFor({ timeout: 1000 })
            await expect(page).toHaveScreenshot('allow-listed.png')
            await page.locator('[aria-pressed="false"]').click()
            await page.waitForTimeout(1000)
            // @ts-ignore
            const out = await requests.outgoing({ names: ['setList'] })
            expect(out).toMatchObject([
                {
                    messageType: 'setList',
                    options: {
                        list: 'denylisted',
                        domain: 'example.com',
                        value: false,
                    },
                },
                {
                    messageType: 'setList',
                    options: {
                        list: 'allowlisted',
                        domain: 'example.com',
                        value: false, // <-- This is protections being re-enabled
                    },
                },
            ])
        })
    })
    test.describe('When the site has content blocking disabled', () => {
        test('then pressing the toggle re-enables protections (overriding our decision)', async ({ page }) => {
            const requests = await withExtensionRequests(page, {
                requestData: { requests: [] },
                tab: {
                    id: 1533,
                    url: 'https://example.com',
                    upgradedHttps: false,
                    protections: {
                        denylisted: false,
                        allowlisted: false,
                        enabledFeatures: [],
                        unprotectedTemporary: false,
                    },
                },
            })
            await page.goto(HTML)
            await page.locator('"No Tracking Requests Found"').waitFor({ timeout: 1000 })
            await expect(page).toHaveScreenshot('content-blocking-disabled.png')
            await page.locator('[aria-pressed="false"]').click()
            await page.waitForTimeout(1000)
            // @ts-ignore
            const out = await requests.outgoing({ names: ['setList'] })
            expect(out).toMatchObject([
                {
                    messageType: 'setList',
                    options: {
                        list: 'denylisted',
                        domain: 'example.com',
                        value: true, // <-- This is protections being re-enabled by the user, overriding us
                    },
                },
            ])
        })
    })
})

test.describe('special page (cta)', () => {
    test('should render correctly', async ({ page }) => {
        await withExtensionRequests(page, {
            tab: {
                id: 1533,
                url: 'https://example.com',
                upgradedHttps: false,
                protections: {
                    unprotectedTemporary: false,
                    enabledFeatures: ['contentBlocking'],
                    denylisted: false,
                    allowlisted: false,
                },
                specialDomainName: 'extensions',
            },
            requestData: { requests: [] },
            emailProtectionUserData: {
                cohort: 'private_beta_dax',
                nextAlias: '123456_next',
                token: '123456',
                userName: 'daxtheduck',
            },
        })
        await page.goto(HTML)
        await page.locator('"Love using DuckDuckGo?"').waitFor({ timeout: 500 })
        await expect(page).toHaveScreenshot('cta.png')
    })
})
