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
        await page.goto("http://127.0.0.1:5173", wait_until="commit", timeout=10000)

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
        # -> Navigate to http://127.0.0.1:5173
        await page.goto("http://127.0.0.1:5173", wait_until="commit", timeout=10000)
        
        # -> Click the 'Horario' link in the header to open the schedule page, then wait for classes to load.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=html/body/div/div/header/div/div[2]/nav/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Click the first 'Reservar Cupo' button on the first class card (interactive element index 167) to open the booking modal.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[3]/div[1]/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        # -> Wait for the booking modal (dialog) to appear
        modal = frame.locator('role=dialog').first
        await modal.wait_for(state="visible", timeout=5000)
        assert await modal.is_visible(), "Booking modal did not become visible"
        
        # -> Verify a name input exists inside the modal
        name_selectors = [
            'input[name="name"]',
            'input[name="nombre"]',
            'input[placeholder*="Nombre"]',
            'input[aria-label*="Nombre"]',
            'input[type="text"]'
        ]
        name_locator = None
        for sel in name_selectors:
            loc = modal.locator(sel)
            if await loc.count() > 0:
                name_locator = loc.first
                break
        assert name_locator is not None and await name_locator.is_visible(), "Name input not found in booking modal"
        
        # -> Verify an email input exists inside the modal
        email_selectors = [
            'input[type="email"]',
            'input[name="email"]',
            'input[name="correo"]',
            'input[placeholder*="Email"]',
            'input[placeholder*="Correo"]',
            'input[aria-label*="Correo"]'
        ]
        email_locator = None
        for sel in email_selectors:
            loc = modal.locator(sel)
            if await loc.count() > 0:
                email_locator = loc.first
                break
        assert email_locator is not None and await email_locator.is_visible(), "Email input not found in booking modal"
        
        # -> Verify a submit button exists inside the modal
        submit_candidates = modal.locator('button[type="submit"], button:has-text("Reservar"), button:has-text("Enviar"), button:has-text("Unirse")')
        assert await submit_candidates.count() > 0 and await submit_candidates.first.is_visible(), "Submit button not found in booking modal"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    