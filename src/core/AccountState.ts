import type { Config } from '../config/Config'
import type { ActivityResult } from '../rewards/types/ActivityResult'
import type { RewardsState } from '../rewards/types/RewardsState'
import type { StreakProtectionState } from '../rewards/shared/parsers/RewardsPageParser'
import { activityLabel, activityReason } from '../logging/LogMessage'
import { activityKey } from '../rewards/shared/ActivityCompletion'
import { pointValue } from '../rewards/shared/PointAccounting'

function parseBoolFlag(value: unknown): boolean | null {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
        const lower = value.trim().toLowerCase()
        if (lower === 'true' || lower === '1') return true
        if (lower === 'false' || lower === '0') return false
    }
    return null
}

export class AccountDeferredError extends Error {
    constructor(readonly reason: string) {
        super(reason)
        this.name = 'AccountDeferredError'
    }
}

export type WarningStatus = 'clear' | 'restricted' | 'unknown'

export class AccountState {
    readonly results: Array<ActivityResult & { activity: string; platform: 'mobile' | 'desktop' }> = []
    readonly issues = new Map<string, string>()
    readonly taskReadyAt = new Map<'mobile' | 'desktop', number>()
    readonly searchOnBingAttempts = new Map<string, Set<string>>()
    readonly loggedStreaks = new Set<string>()
    private controller = new AbortController()
    initialBalance: number | null = null
    dailyCheckIn: Promise<ActivityResult> | null = null
    backgroundRewardsActive = false
    warningStatus: WarningStatus = 'unknown'
    streakProtection: StreakProtectionState | null = null
    todayStreakComplete: boolean | null = null

    get signal(): AbortSignal {
        return this.controller.signal
    }

    reset(): void {
        this.results.length = 0
        this.issues.clear()
        this.taskReadyAt.clear()
        this.searchOnBingAttempts.clear()
        this.loggedStreaks.clear()
        this.controller = new AbortController()
        this.warningStatus = 'unknown'
        this.initialBalance = null
        this.dailyCheckIn = null
        this.backgroundRewardsActive = false
        this.streakProtection = null
        this.todayStreakComplete = null
    }

    record(activity: string, result: ActivityResult, isMobile: boolean): boolean {
        const platform = isMobile ? 'mobile' : 'desktop'
        if (activity.endsWith('-data') || activity.endsWith('-quota')) {
            const previous = [...this.results]
                .reverse()
                .find(item => item.activity === activity && item.platform === platform)
            if (previous?.status === result.status && previous.reason === result.reason) return false
        }
        this.results.push({ activity, platform, ...result })
        const key = activityKey(activity, result, platform)
        if (result.status === 'failed' || result.status === 'unconfirmed')
            this.issues.set(
                key,
                `${activityLabel(activity)}${result.title ? ` (${result.title})` : ''}: ${activityReason(result)}`
            )
        else this.issues.delete(key)
        return true
    }

    observe(data: RewardsState, config: Pick<Config, 'continueOnBotWarning'>): void {
        this.initialBalance ??= data.dashboard.userStatus.availablePoints
        const promo = data.dashboard.streakProtectionPromo
        if (promo) {
            const status = parseBoolFlag(promo.streakProtectionStatus)
            if (status !== null) {
                this.streakProtection = {
                    isProtectionOn: status,
                    remainingDays: pointValue(promo.remainingDays),
                    streakCounter:
                        pointValue(promo.streakCount) ?? pointValue(data.dashboard.streakPromotion?.activityProgress)
                }
            }
            const todayComplete = parseBoolFlag(promo.isTodayStreakComplete)
            if (todayComplete !== null) {
                this.todayStreakComplete = todayComplete
            }
        }
        const warnings = data.dashboard.userWarnings
        this.warningStatus = warnings.some(warning => warning.name === 'Fraud_UserWarning_BotScore_UX')
            ? 'restricted'
            : data.sourceInfo.missingSections.includes('userWarnings')
              ? 'unknown'
              : 'clear'
        if (this.warningStatus === 'restricted' && !config.continueOnBotWarning)
            this.defer('Microsoft bot-score warning detected')
    }

    defer(reason: string): void {
        this.issues.set(reason, reason)
        this.controller.abort(new AccountDeferredError(reason))
    }
}
