import type { Config } from './Config'

export const defaultConfig: Config = {
    sessionPath: 'sessions',
    headless: true,
    clusters: 6,
    rewardsMode: 'browser',
    errorDiagnostics: false,
    ensureStreakProtection: true,
    autoClaimPunchcardRewards: true,
    continueOnBotWarning: true,
    skipNonPointTasks: true,
    accountDelay: { min: '30sec', max: '1min' },
    taskDelay: { min: '12sec', max: '20sec' },
    workers: {
        doDailySet: true,
        doClaimBonusPoints: true,
        doMorePromotions: true,
        doPunchCards: true,
        doAppPromotions: true,
        doDesktopSearch: true,
        doMobileSearch: true,
        doBonusSearches: true,
        doDailyCheckIn: true,
        doReadToEarn: true,
        doActivateSearchPerk: true,
        doVisualSearch: true
    },
    activities: { urlReward: true, searchOnBing: true },
    searchOnBingLocalQueries: false,
    globalTimeout: '30sec',
    searchSettings: {
        scrollRandomResults: true,
        clickRandomResults: true,
        runOnZeroPoints: false,
        maxBonusSearches: 110,
        maxSearchOnBingAttempts: 3,
        parallelSearching: false,
        clusterSearch: false,
        useAccountLocale: true,
        queryEngines: ['google', 'wikipedia', 'wikirandom', 'reddit', 'hackernews', 'rss.googleNews', 'local'],
        searchResultVisitTime: '12sec',
        searchDelay: { min: '18sec', max: '45sec' },
        readDelay: { min: '20s', max: '30sec' }
    },
    experimental: { blockMedia: false, edgeBrowsing: true, browserSearchApiReport: false },
    debugLogs: false,
    consoleLogFilter: {
        enabled: false,
        mode: 'whitelist',
        levels: ['error', 'warn'],
        keywords: ['starting account', 'Fraud_UserWarning_BotScore_UX'],
        regexPatterns: []
    },
    proxy: { queryEngine: true, ignoreCertificateErrors: false },
    webhook: {
        discord: { enabled: false, url: '' },
        telegram: { enabled: false, botToken: '', chatId: '' },
        ntfy: {
            enabled: false,
            url: '',
            topic: '',
            token: '',
            title: 'Microsoft-Rewards-Script',
            tags: ['bot', 'notify'],
            priority: 3
        },
        webhookLogFilter: {
            enabled: false,
            mode: 'whitelist',
            levels: ['error'],
            keywords: ['starting account', 'select number', 'collected', 'Fraud_UserWarning_BotScore_UX'],
            regexPatterns: []
        }
    }
}
