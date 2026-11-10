import { ghostClick } from '../../../browser/GhostClick'
import type { Locator, Page } from 'patchright'
import { URLs } from '../../../constants/urls'

const MIN_KEY_DELAY_MS = 45
const MAX_KEY_DELAY_MS = 115
const MIN_PRE_FOCUS_PAUSE_MS = 350
const MAX_PRE_FOCUS_PAUSE_MS = 1100

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function bingSearchBox(page: Page): Locator {
    return page.locator('#sb_form_q:visible:not([disabled]):not([readonly])').first()
}

export async function humanType(page: Page, query: string, timeout = 30000, signal?: AbortSignal): Promise<Locator> {
    await page.bringToFront()
    const searchBox = bingSearchBox(page)
    await searchBox.waitFor({ state: 'visible', timeout })
    await ghostClick(page, searchBox, timeout, signal)
    await searchBox.fill('', { timeout })
    await searchBox.pressSequentially(query, { delay: randomInt(MIN_KEY_DELAY_MS, MAX_KEY_DELAY_MS), timeout })
    return searchBox
}

export async function submitSearch(
    page: Page,
    query: string,
    searchBox: Locator,
    timeout = 45000,
    signal?: AbortSignal
): Promise<void> {
    const deadline = Date.now() + timeout
    const remaining = (): number => {
        signal?.throwIfAborted()
        return Math.max(1, deadline - Date.now())
    }
    const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase()
    remaining()
    await page.bringToFront()
    await searchBox.press('Escape', { timeout: remaining() })
    if ((await searchBox.inputValue({ timeout: remaining() })) !== query) {
        await searchBox.fill(query, { timeout: remaining() })
    }
    await Promise.all([
        page.waitForURL(
            url =>
                url.origin === URLs.bing.origin &&
                url.pathname === '/search' &&
                normalize(url.searchParams.get('q') ?? '') === normalize(query),
            { waitUntil: 'commit', timeout: remaining() }
        ),
        searchBox.press('Enter', { timeout: remaining() })
    ])

    await page.locator('#b_results').waitFor({ state: 'visible', timeout: remaining() })
    remaining()
}

export function humanPreFocusPauseMs(): number {
    return randomInt(MIN_PRE_FOCUS_PAUSE_MS, MAX_PRE_FOCUS_PAUSE_MS)
}
