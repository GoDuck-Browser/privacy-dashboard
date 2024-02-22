// Generated by ts-to-zod
import { z } from "zod";

export const protectionsDisabledReasonSchema = z.literal("protectionDisabled");

export const ownedByFirstPartyReasonSchema = z.literal("ownedByFirstParty");

export const ruleExceptionReasonSchema = z.literal("ruleException");

export const adClickAttributionReasonSchema = z.literal("adClickAttribution");

export const otherThirdPartyRequestReasonSchema = z.literal("otherThirdPartyRequest");

export const screenKindSchema = z.union([z.literal("primaryScreen"), z.literal("breakageForm"), z.literal("simpleBreakageReport")]);

export const stateBlockedSchema = z.object({
    blocked: z.record(z.unknown())
});

export const stateAllowedSchema = z.object({
    allowed: z.object({
        reason: z.union([protectionsDisabledReasonSchema, ownedByFirstPartyReasonSchema, ruleExceptionReasonSchema, adClickAttributionReasonSchema, otherThirdPartyRequestReasonSchema])
    })
});

export const extensionMessageGetPrivacyDashboardDataSchema = z.object({
    messageType: z.literal("getPrivacyDashboardData"),
    options: z.object({
        tabId: z.number().optional().nullable()
    })
});

export const emailProtectionUserDataSchema = z.object({
    nextAlias: z.string()
});

export const protectionsStatusSchema = z.object({
    unprotectedTemporary: z.boolean(),
    enabledFeatures: z.array(z.string()),
    allowlisted: z.boolean(),
    denylisted: z.boolean()
});

export const localeSettingsSchema = z.object({
    locale: z.string()
});

export const parentEntitySchema = z.object({
    displayName: z.string(),
    prevalence: z.number()
});

export const fireButtonSchema = z.object({
    enabled: z.boolean()
});

export const searchSchema = z.object({
    term: z.string()
});

export const breakageReportRequestSchema = z.object({
    category: z.string().optional(),
    description: z.string().optional()
});

export const setListOptionsSchema = z.object({
    lists: z.array(z.object({
        list: z.union([z.literal("allowlisted"), z.literal("denylisted")]),
        domain: z.string(),
        value: z.boolean()
    }))
});

export const windowsIncomingVisibilitySchema = z.object({
    Feature: z.literal("PrivacyDashboard"),
    Name: z.literal("VisibilityChanged"),
    Data: z.object({
        isVisible: z.boolean()
    })
});

export const cookiePromptManagementStatusSchema = z.object({
    consentManaged: z.boolean(),
    cosmetic: z.boolean().optional(),
    optoutFailed: z.boolean().optional(),
    selftestFailed: z.boolean().optional(),
    configurable: z.boolean().optional()
});

export const refreshAliasResponseSchema = z.object({
    personalAddress: z.string(),
    privateAddress: z.string()
});

export const extensionMessageSetListOptionsSchema = z.object({
    messageType: z.literal("setLists"),
    options: setListOptionsSchema
});

export const fireOptionSchema = z.record(z.unknown()).and(z.object({
    name: z.union([z.literal("CurrentSite"), z.literal("LastHour"), z.literal("Last24Hour"), z.literal("Last7days"), z.literal("Last4Weeks"), z.literal("AllTime")]),
    selected: z.boolean().optional(),
    options: z.object({
        since: z.number().optional(),
        origins: z.array(z.string()).optional()
    }),
    descriptionStats: z.object({
        clearHistory: z.boolean(),
        site: z.string().optional(),
        duration: z.union([z.literal("hour"), z.literal("day"), z.literal("week"), z.literal("month"), z.literal("all")]),
        openTabs: z.number(),
        cookies: z.number(),
        pinnedTabs: z.number()
    })
}));

export const primaryScreenSchema = z.object({
    layout: z.union([z.literal("default"), z.literal("highlighted-protections-toggle")])
});

export const eventOriginSchema = z.object({
    screen: screenKindSchema
});

export const siteUrlAdditionalDataSchema = z.object({
    url: z.string()
});

export const detectedRequestSchema = z.object({
    url: z.string(),
    eTLDplus1: z.string().optional(),
    pageUrl: z.string(),
    state: z.union([stateBlockedSchema, stateAllowedSchema]),
    entityName: z.string().optional(),
    category: z.string().optional(),
    prevalence: z.number().optional(),
    ownerName: z.string().optional()
});

export const tabSchema = z.object({
    id: z.number().optional(),
    url: z.string(),
    upgradedHttps: z.boolean(),
    protections: protectionsStatusSchema,
    localeSettings: localeSettingsSchema.optional(),
    parentEntity: parentEntitySchema.optional(),
    specialDomainName: z.string().optional()
});

export const breakageReportSchema = z.object({
    request: breakageReportRequestSchema.optional(),
    response: z.record(z.unknown()).optional()
});

export const fireButtonDataSchema = z.object({
    options: z.array(fireOptionSchema)
});

export const remoteFeatureSettingsSchema = z.object({
    primaryScreen: primaryScreenSchema.optional()
});

export const setProtectionParamsSchema = z.object({
    isProtected: z.boolean(),
    eventOrigin: eventOriginSchema
});

export const simpleReportScreenDataItemSchema = z.object({
    id: z.union([z.literal("wvVersion"), z.literal("requests"), z.literal("features"), z.literal("appVersion"), z.literal("atb"), z.literal("category"), z.literal("description"), z.literal("errorDescriptions"), z.literal("extensionVersion"), z.literal("httpErrorCodes"), z.literal("lastSentDay"), z.literal("loginSite"), z.literal("device"), z.literal("os"), z.literal("listVersions"), z.literal("reportFlow"), z.literal("siteUrl")]),
    additional: siteUrlAdditionalDataSchema.optional()
});

export const requestDataSchema = z.object({
    requests: z.array(detectedRequestSchema),
    installedSurrogates: z.array(z.string()).optional()
});

export const getPrivacyDashboardDataSchema = z.object({
    requestData: requestDataSchema,
    emailProtectionUserData: emailProtectionUserDataSchema.optional(),
    tab: tabSchema,
    fireButton: fireButtonSchema.optional()
});

export const windowsViewModelSchema = z.object({
    protections: protectionsStatusSchema,
    rawRequestData: requestDataSchema,
    tabUrl: z.string(),
    upgradedHttps: z.boolean(),
    parentEntity: parentEntitySchema.optional(),
    permissions: z.array(z.unknown()).optional(),
    certificates: z.array(z.unknown()).optional(),
    cookiePromptManagementStatus: cookiePromptManagementStatusSchema.optional()
});

export const simpleReportScreenSchema = z.object({
    opener: z.union([z.literal("menu"), z.literal("dashboard")]),
    data: z.array(simpleReportScreenDataItemSchema)
});

export const windowsIncomingViewModelSchema = z.object({
    Feature: z.literal("PrivacyDashboard"),
    Name: z.literal("ViewModelUpdated"),
    Data: windowsViewModelSchema
});

export const windowsIncomingMessageSchema = z.union([windowsIncomingVisibilitySchema, windowsIncomingViewModelSchema]);

export const apiSchema = z.object({
    "request-data": requestDataSchema,
    "extension-message-get-privacy-dashboard-data": extensionMessageGetPrivacyDashboardDataSchema,
    "get-privacy-dashboard-data": getPrivacyDashboardDataSchema.optional(),
    "search-message": searchSchema.optional(),
    "breakage-report": breakageReportSchema,
    "set-list": setListOptionsSchema.optional(),
    "windows-incoming-message": windowsIncomingMessageSchema.optional(),
    "locale-settings": localeSettingsSchema.optional(),
    "refresh-alias-response": refreshAliasResponseSchema.optional(),
    exe: extensionMessageSetListOptionsSchema.optional(),
    "fire-button": fireButtonDataSchema.optional(),
    "feature-settings": remoteFeatureSettingsSchema.optional(),
    "set-protection": setProtectionParamsSchema.optional(),
    "simple-report-screen": simpleReportScreenSchema.optional()
});

