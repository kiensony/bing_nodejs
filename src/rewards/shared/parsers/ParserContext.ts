import type { Logger } from '../../../logging/Logger'
import type { StreakProtectionState, StreakState } from './RewardsPageParser'

export interface ParserContext {
    readonly logger: Pick<Logger, 'event' | 'warn' | 'debug' | 'error'>
    readonly isMobile: boolean
    readonly currentAccountEmail: string | null
    readonly userData?: { timezone: string }
    readonly accountState?: {
        readonly streakProtection: StreakProtectionState | null
        readonly todayStreakComplete: boolean | null
    }
    observeStreaks?(streaks: readonly StreakState[]): void
}
