import { test, expect } from '@playwright/test';

/* Behaviours asserted here hold whether or not anime.js loads from the CDN:
   if the module fails, the page falls back to `.no-anim` and counters/bars
   still run via rAF + CSS. */

test('loads, loader clears, hero becomes visible without fatal errors', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  await page.goto('/');

  await expect(page.locator('.hero-title .accent')).toContainText('agent');
  await expect(page.locator('.hero-title [data-split]').first()).toHaveCSS('opacity', '1', { timeout: 9000 });
  await expect(page.locator('#loader')).toBeHidden({ timeout: 12000 });

  // ignore expected CDN/import network noise; fail on real script errors
  const fatal = errors.filter((e) => !/Failed to fetch|Importing|net::|jsdelivr|dynamically imported|MIME/i.test(e));
  expect(fatal, fatal.join('\n')).toEqual([]);
});

test('hero stat counts up to a comma-formatted 1,000,000', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-stat .num')).toHaveText(/1,000,000/, { timeout: 9000 });
});

test('benchmarks: bars fill and numbers count when scrolled into view', async ({ page }) => {
  await page.goto('/');
  await page.locator('#benchmarks').scrollIntoViewIfNeeded();

  const heroBar = page.locator('#benchmarks .fill.hero-bar');
  await expect.poll(
    async () => heroBar.evaluate((el) => el.getBoundingClientRect().width),
    { timeout: 9000 }
  ).toBeGreaterThan(20);

  await expect(page.locator('#benchmarks .bench').first().locator('b')).toHaveText(/80\.6%/, { timeout: 9000 });
  await expect(page.locator('#benchmarks .elo-num')).toHaveText(/3,206/, { timeout: 9000 });
});

test('model section counters render with suffixes', async ({ page }) => {
  await page.goto('/');
  await page.locator('#model').scrollIntoViewIfNeeded();
  await expect(page.locator('#model .stat-card').first().locator('.num')).toHaveText(/1\.6T/, { timeout: 9000 });
});

test('nav solidifies after scrolling', async ({ page }) => {
  await page.goto('/');
  await page.mouse.wheel(0, 700);
  await expect(page.locator('#nav')).toHaveClass(/solid/, { timeout: 4000 });
});

test('npm chip toggles a copied state on click', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  await page.goto('/');
  const chip = page.locator('.hero-actions .npm-chip').first();
  await chip.click();
  await expect(chip).toHaveClass(/copied/, { timeout: 3000 });
});

test('reasoning_effort slider snaps and updates the readout', async ({ page }) => {
  await page.goto('/');
  await page.locator('#agentic').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const track = page.locator('#effortTrack');
  const w = (await track.boundingBox()).width;
  const val = page.locator('#effortVal');

  await track.click({ position: { x: Math.round(w * 0.05), y: 4 } });
  await expect(val).toHaveText('none', { timeout: 3000 });

  await track.click({ position: { x: Math.round(w * 0.5), y: 4 } });
  await expect(val).toHaveText('high');

  await track.click({ position: { x: Math.round(w * 0.95), y: 4 } });
  await expect(val).toHaveText('max');
});

test('api section types out the code block with the swapped model name', async ({ page }) => {
  await page.goto('/');
  await page.locator('#api').scrollIntoViewIfNeeded();
  await expect(page.locator('#codeBlock')).toContainText('deepseek-v4-pro', { timeout: 9000 });
  await expect(page.locator('#codeBlock')).toContainText('api.deepseek.com');
});

test('open section shows official repos with live star counters', async ({ page }) => {
  await page.goto('/');
  await page.locator('#open').scrollIntoViewIfNeeded();
  await expect(page.locator('#open .gh-chip')).toHaveCount(8);
  await expect(page.locator('#open .gh-chip').first().locator('.num')).toHaveText(/103\.7k/, { timeout: 9000 });
  await expect(page.locator('#open .gh-chip').first()).toHaveAttribute('href', /github\.com\/deepseek-ai\/DeepSeek-V3/);
});

test('repos constellation: 10 community agents with star counters and links', async ({ page }) => {
  await page.goto('/');
  await page.locator('#repos').scrollIntoViewIfNeeded();
  await expect(page.locator('#repos .repo')).toHaveCount(10);
  const first = page.locator('#repos .repo').first();
  await expect(first).toHaveAttribute('href', /github\.com\/Hmbown\/DeepSeek-TUI/);
  await expect(first.locator('.num')).toHaveText(/38\.2k/, { timeout: 9000 });
  await expect(page.locator('#repos .repo-foot a').first()).toHaveAttribute('href', /awesome-deepseek-agent/);
});

test('captures hero + full-page screenshots', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(6200); // let the full intro timeline settle
  await page.screenshot({ path: 'tests/__screenshots__/hero.png' });
  for (const id of ['what', 'model', 'agentic', 'benchmarks', 'api', 'pricing', 'open', 'repos', 'ecosystem', 'cta']) {
    await page.locator('#' + id).scrollIntoViewIfNeeded();
    await page.waitForTimeout(550);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'tests/__screenshots__/full.png', fullPage: true });
});
