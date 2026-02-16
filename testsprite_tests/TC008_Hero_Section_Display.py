import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:5173", wait_until="commit", timeout=10000)

        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass

        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:5173
        await page.goto("http://localhost:5173", wait_until="commit", timeout=10000)
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        # --- Assertions appended to the existing async test ---
        # Verify the Lagunita Health Club logo image is visible (or fallback to title text)
        logo_img = page.locator('img[alt*="Lagunita"]')
        if await logo_img.count() > 0:
            assert await logo_img.is_visible(), "Expected Lagunita logo image to be visible"
        else:
            title = page.locator('text="Lagunita Health Club"')
            assert await title.is_visible(), "Expected 'Lagunita Health Club' title to be visible as logo fallback"
        
        # Verify the tagline text is displayed (match the beginning to be tolerant of accents/variants)
        tagline = page.locator('text=Tu bienestar empieza')
        assert await tagline.is_visible(), "Expected tagline 'Tu bienestar empieza...' to be visible"
        
        # Helper to check multiple text variants (handles accent variations)
        async def _any_visible(*variants):
            for v in variants:
                loc = page.locator(f'text="{v}"')
                if await loc.count() and await loc.is_visible():
                    return True
            return False
        
        # Verify the stats show 6 Días
        assert await _any_visible('6 Días', '6 Dias'), "Expected stats to show '6 Días'"
        
        # Verify the stats show 23 Clases
        assert await _any_visible('23 Clases', '23 Clases'), "Expected stats to show '23 Clases'"
        
        # Verify the stats show 8 Disciplinas
        assert await _any_visible('8 Disciplinas', '8 Disciplinas'), "Expected stats to show '8 Disciplinas'"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    