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
        
        # -> Navigate to /admin route (use direct URL since no admin link exists on the current page)
        await page.goto("http://localhost:5173/admin", wait_until="commit", timeout=10000)
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        # -> Assertions for admin dashboard
        assert "/admin" in page.url
        assert await page.locator("text=Panel de Administración").is_visible()
        assert await page.locator("text=23 clases programadas").is_visible()
        
        # -> Verify day sections are visible
        assert await page.locator("text=Lunes").is_visible()
        assert await page.locator("text=Martes").is_visible()
        assert await page.locator("text=Miércoles").is_visible()
        assert await page.locator("text=Jueves").is_visible()
        assert await page.locator("text=Viernes").is_visible()
        assert await page.locator("text=Sábado").is_visible()
        
        # -> Verify class listings appear (at least one)
        assert await page.locator("text=Instructor").count() >= 1
        assert await page.locator("text=07:00").count() >= 1
        
        # -> Verify 'Agregar Clase' add button is present
        assert await page.locator("text=Agregar Clase").is_visible()
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    