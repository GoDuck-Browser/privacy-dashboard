/**
 * This can be used in playwright + preview environments
 *
 * @param {object} params
 * @param {import("../../ui/views/tests/generate-data.mjs").MockData} params.state
 * @param {import('../../ui/platform-features.mjs').Platform} params.platform
 * @param {Record<string, any>} params.messages
 */
export function sharedMockDataProvider(params) {
    const { state, platform, messages } = params;

    // ensure certain globals are assigned. This is how the browser/extension mocks work
    Object.assign(window.__playwright.messages, messages);

    // on windows, all data is delivered through a single API call.
    if (platform?.name === 'windows') {
        if (!window.__playwright.messages.windowsViewModel) throw new Error('missing `windowsViewModel` on messages');
        for (const listener of window.__playwright.listeners || []) {
            listener({
                data: window.__playwright.messages.windowsViewModel,
            });
        }
        return;
    }

    // in the 'browser/extension' scenario, we trigger the `updateTabData` event, and the Object.assign
    // above takes care of ensuring the correct data is available on `window.__playwright.messages.x`
    if (platform?.name === 'browser') {
        for (const listener of window.__playwright.listeners || []) {
            listener({ updateTabData: true }, { id: 'test' });
        }
        return;
    }

    // If we get here, we're on ios/android or macOS - where everything is delivered through window methods
    if (state.cookiePromptManagementStatus) {
        window.onChangeConsentManaged(state.cookiePromptManagementStatus);
    }
    if (state.permissions) {
        window.onChangeAllowedPermissions(state.permissions);
    }
    window.onChangeParentEntity(state.parentEntity);
    window.onChangeProtectionStatus(state.protections);
    window.onChangeUpgradedHttps(state.upgradedHttps);
    window.onChangeCertificateData({
        secCertificateViewModels: state.certificate,
        isInvalidCert: state.isInvalidCert,
    });
    if (state.remoteFeatureSettings) {
        window.onChangeFeatureSettings?.(state.remoteFeatureSettings);
    }
    window.onChangeLocale?.(state.localeSettings);
    window.onChangeRequestData(state.url, { requests: state.requests || [] });

    if (platform?.name === 'macos' || platform?.name === 'ios' || platform?.name === 'android' || platform?.name === 'windows') {
        window.onChangeMaliciousSiteStatus?.(state.maliciousSiteStatus);
    }
}

export function windowsMockApis() {
    try {
        if (!window.chrome) {
            // @ts-ignore
            window.chrome = {};
        }
        window.__playwright = {
            listeners: [],
            responses: {},
            messages: {},
            mocks: {
                outgoing: [],
                incoming: [],
            },
            calls: [],
        };
        globalThis.windowsInteropAddEventListener = (messageName, listener) => {
            window.__playwright.listeners?.push(listener);
        };
        globalThis.windowsInteropPostMessage = (arg) => {
            window.__playwright.mocks.outgoing.push([arg.Name, arg]);

            let responseData;
            switch (arg.Name) {
                case 'GetToggleReportOptions': {
                    if (!window.__playwright.messages.GetToggleReportOptions)
                        throw new Error('missing `GetToggleReportOptions` on messages');
                    responseData = structuredClone(window.__playwright.messages.GetToggleReportOptions);
                    responseData.id = String(arg.Id);
                }
            }

            if (responseData) {
                setTimeout(() => {
                    for (const listener of window.__playwright.listeners || []) {
                        listener({
                            data: responseData,
                        });
                    }
                }, 0);
            }
        };
    } catch (e) {
        console.error("❌couldn't set up mocks");
        console.error(e);
    }
}

/**
 * @param {object} params
 * @param {Partial<Record<keyof WebkitMessageHandlers, any>>} params.messages
 */
export function webkitMockApis({ messages = {} }) {
    try {
        window.__playwright = {
            messages,
            responses: {},
            mocks: {
                outgoing: [],
                incoming: [],
            },
            calls: [],
        };
        window.webkit = {
            messageHandlers: {
                privacyDashboardTelemetrySpan: {
                    postMessage: (arg) => {
                        window.__playwright.mocks.outgoing.push(['privacyDashboardTelemetrySpan', arg]);
                    },
                },
                privacyDashboardShowNativeFeedback: {
                    postMessage: (arg) => {
                        window.__playwright.mocks.outgoing.push(['privacyDashboardShowNativeFeedback', arg]);
                    },
                },
                privacyDashboardShowReportBrokenSite: {
                    postMessage: (arg) => {
                        window.__playwright.mocks.outgoing.push(['privacyDashboardShowReportBrokenSite', arg]);
                    },
                },
                privacyDashboardReportBrokenSiteShown: {
                    postMessage: (arg) => {
                        window.__playwright.mocks.outgoing.push(['privacyDashboardReportBrokenSiteShown', arg]);
                    },
                },
                privacyDashboardOpenUrlInNewTab: {
                    postMessage: (arg) => {
                        window.__playwright.mocks.outgoing.push(['privacyDashboardOpenUrlInNewTab', arg]);
                    },
                },
                privacyDashboardOpenSettings: {
                    postMessage: (arg) => {
                        window.__playwright.mocks.outgoing.push(['privacyDashboardOpenSettings', arg]);
                    },
                },
                privacyDashboardSubmitBrokenSiteReport: {
                    postMessage: (arg) => {
                        window.__playwright.mocks.outgoing.push(['privacyDashboardSubmitBrokenSiteReport', arg]);
                    },
                },
                privacyDashboardSetSize: {
                    postMessage: (arg) => {
                        window.__playwright.mocks.outgoing.push(['privacyDashboardSetSize', arg]);
                    },
                },
                privacyDashboardClose: {
                    postMessage: (arg) => {
                        window.__playwright.mocks.outgoing.push(['privacyDashboardClose', arg]);
                    },
                },
                privacyDashboardSetProtection: {
                    postMessage: (arg) => {
                        window.__playwright.mocks.outgoing.push(['privacyDashboardSetProtection', arg]);
                    },
                },
                privacyDashboardSetPermission: {
                    postMessage: (arg) => {
                        window.__playwright.mocks.outgoing.push(['privacyDashboardSetPermission', arg]);
                    },
                },
                privacyDashboardSendToggleReport: {
                    postMessage: async (arg) => {
                        window.__playwright.mocks.outgoing.push(['privacyDashboardSendToggleReport', arg]);
                    },
                },
                privacyDashboardRejectToggleReport: {
                    postMessage: async (arg) => {
                        window.__playwright.mocks.outgoing.push(['privacyDashboardRejectToggleReport', arg]);
                    },
                },
                privacyDashboardSeeWhatIsSent: {
                    postMessage: async (arg) => {
                        window.__playwright.mocks.outgoing.push(['privacyDashboardSeeWhatIsSent', arg]);
                    },
                },
                privacyDashboardGetToggleReportOptions: {
                    postMessage: (arg) => {
                        window.__playwright.mocks.outgoing.push(['privacyDashboardGetToggleReportOptions', arg]);
                        setTimeout(() => {
                            window.onGetToggleReportOptionsResponse?.(window.__playwright.messages.privacyDashboardGetToggleReportOptions);
                        }, 0);
                    },
                },
            },
        };
    } catch (e) {
        console.error("❌couldn't set up mocks");
        console.error(e);
    }
}

/**
 * @param {object} params
 * @param {Partial<Record<keyof Window['PrivacyDashboard'], any>>} params.messages
 */
export function mockAndroidApis({ messages = {} }) {
    try {
        window.__playwright = {
            messages,
            responses: {},
            mocks: {
                outgoing: [],
                incoming: [],
            },
            calls: [],
        };
        window.PrivacyDashboard = {
            showBreakageForm(arg) {
                window.__playwright.mocks.outgoing.push(['showBreakageForm', arg]);
            },
            openInNewTab(arg) {
                window.__playwright.mocks.outgoing.push(['openInNewTab', arg]);
            },
            openSettings(arg) {
                window.__playwright.mocks.outgoing.push(['openSettings', arg]);
            },
            close(arg) {
                window.__playwright.mocks.outgoing.push(['close', arg]);
            },
            toggleAllowlist(arg) {
                window.__playwright.mocks.outgoing.push(['toggleAllowlist', arg]);
            },
            submitBrokenSiteReport(arg) {
                window.__playwright.mocks.outgoing.push(['submitBrokenSiteReport', arg]);
            },
            getToggleReportOptions() {
                const response = window.__playwright.messages.getToggleReportOptions;
                if (!response) throw new Error('unreachable, missing mock for getToggleReportOptions');

                setTimeout(() => {
                    window.onGetToggleReportOptionsResponse?.(response);
                }, 0);
            },
            sendToggleReport() {
                window.__playwright.mocks.outgoing.push(['sendToggleReport']);
            },
            rejectToggleReport() {
                window.__playwright.mocks.outgoing.push(['rejectToggleReport']);
            },
            seeWhatIsSent() {
                window.__playwright.mocks.outgoing.push(['seeWhatIsSent']);
            },
            showNativeFeedback() {
                window.__playwright.mocks.outgoing.push(['showNativeFeedback']);
            },
            reportBrokenSiteShown() {
                window.__playwright.mocks.outgoing.push(['reportBrokenSiteShown']);
            },
        };
    } catch (e) {
        console.error("❌couldn't set up mocks");
        console.error(e);
    }
}

/**
 * @param {object} params
 * @param {Record<string, any>} params.messages
 */
export function mockBrowserApis(params = { messages: {} }) {
    const messages = {
        submitBrokenSiteReport: {},
        setLists: {},
        search: {},
        openOptions: {},
        setBurnDefaultOption: {},
        getToggleReportOptions: {},
        getBreakageFormOptions: {},
        getPrivacyDashboardData: {},
        sendToggleReport: {},
        rejectToggleReport: {},
        seeWhatIsSent: {},
        showNativeFeedback: {},
        doBurn: {},
        getBurnOptions: { clearHistory: true, tabClearEnabled: true, pinnedTabs: 2 },
        refreshAlias: { privateAddress: '__mock__', personalAddress: 'dax' },
        ...params.messages,
    };
    try {
        if (!window.chrome?.permissions) {
            // @ts-ignore
            window.chrome = {
                // @ts-ignore
                permissions: {
                    // eslint-disable-next-line n/no-callback-literal
                    request: (permissions, cb) => cb && cb(true),
                },
            };
        }
        window.__playwright = {
            messages,
            responses: {},
            mocks: {
                outgoing: [],
                incoming: [],
            },
            calls: [],
            listeners: [],
            handler: undefined,
        };

        // override some methods on window.chrome.runtime to fake the incoming/outgoing messages
        // @ts-ignore
        window.chrome.runtime = {
            id: 'test',
            connect: (info) => {
                console.log('connect: ', info.name);
                const port = {
                    onDisconnect: {
                        addListener: (cb) => {
                            console.log('did add onDisconnect listener');
                            window.__playwright.onDisconnect = cb;
                        },
                    },
                    onMessage: {
                        addListener: (cb) => {
                            window.__playwright.handler = cb;
                            console.log('did add onMessage listener');
                        },
                    },
                    postMessage: (message) => {
                        const id = message.id;
                        console.log('[mock] did post message', message);
                        const handler = window.__playwright.handler;
                        if (!handler) throw new Error('no registered handler');

                        function respond(response, timeout = 100) {
                            if (!id) return console.log('not responding since `id` was absent');
                            const responseShape = {
                                messageType: 'response',
                                options: structuredClone(response),
                                id,
                            };
                            console.log('[mock] will respond with', JSON.stringify(responseShape));
                            setTimeout(() => {
                                handler?.(responseShape);
                            }, timeout);
                        }

                        // does the incoming message match one that's been mocked here?
                        const matchingMessage = window.__playwright.messages[message.messageType];

                        if (matchingMessage) {
                            window.__playwright.mocks.outgoing.push([message.messageType, message]);
                            respond(matchingMessage, 200);
                        } else {
                            setTimeout(() => {
                                const matchingMessage = window.__playwright.messages[message.messageType];
                                if (matchingMessage) {
                                    window.__playwright.mocks.outgoing.push([message.messageType, message]);
                                    respond(matchingMessage, 0);
                                } else {
                                    console.trace(`❌ [(mocks): window.chrome.runtime] Missing support for ${JSON.stringify(message)}`);
                                }
                            }, 200);
                        }
                    },
                };

                return /** @type {any} */ (port);
            },
            async sendMessage() {
                // no longer used
            },
        };
    } catch (e) {
        console.error("❌couldn't set up browser mocks");
        console.error(e);
    }
}
