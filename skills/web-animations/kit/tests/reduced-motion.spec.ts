import { test, expect } from '@playwright/test'

test.describe('Reduced motion compliance', () => {
  test('no running animations on a kit demo page when prefers-reduced-motion is set', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    await page.waitForLoadState('networkidle')

    const runningAnimations = await page.evaluate(() => {
      return Array.from(document.getAnimations()).filter(
        (a) => a.playState === 'running'
      ).length
    })

    expect(runningAnimations).toBe(0)
  })

  test('NumberTicker shows final value immediately under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    const tickerEl = page.getByTestId('number-ticker').first()
    if ((await tickerEl.count()) === 0) test.skip()

    const text = (await tickerEl.textContent()) ?? ''
    expect(text).not.toBe('0')
  })

  test('CursorParallax does not move on hover-less environments', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    const parallax = page.getByTestId('cursor-parallax').first()
    if ((await parallax.count()) === 0) test.skip()

    const initialBox = await parallax.boundingBox()
    await page.mouse.move(100, 100)
    await page.mouse.move(500, 500)
    const afterBox = await parallax.boundingBox()

    expect(initialBox?.x).toBe(afterBox?.x)
    expect(initialBox?.y).toBe(afterBox?.y)
  })
})
