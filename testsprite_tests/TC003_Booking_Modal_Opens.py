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
        
        # -> Click the 'Lunes' day button to load the schedule so class cards (and Reservar Cupo buttons) appear.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=html/body/div/div/main/div/div/div[2]/button[1]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Click the first 'Reservar Cupo' button on the Yoga class card (interactive element index 161).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=html/body/div[1]/div/main/div/div/div[3]/div[1]/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        # -> Assert the booking modal opened
        modal = page.locator('[role="dialog"]')
        await modal.wait_for(state='visible', timeout=5000)
        assert await modal.is_visible(), "Booking modal did not become visible after clicking 'Reservar Cupo'"
        
        # -> Verify the modal contains a name input field (try several common selectors/placeholders)
        name_selectors = [
            'input[placeholder*="Nombre" i]',
            'input[aria-label*="Nombre" i]',
            'input[name*="name" i]',
            'input[id*="name" i]',
            'input[type="text"]',
        ]
        name_found = False
        for sel in name_selectors:
            count = await modal.locator(sel).count()
            if count > 0:
                for i in range(count):
                    if await modal.locator(sel).nth(i).is_visible():
                        name_found = True
                        break
            if name_found:
                break
        assert name_found, "Name input field not found in booking modal"
        
        # -> Verify the modal contains an email input field
        email_selectors = [
            'input[type="email"]',
            'input[placeholder*="Correo" i]',
            'input[placeholder*="Email" i]',
            'input[aria-label*="Correo" i]',
            'input[name*="email" i]',
            'input[id*="email" i]',
        ]
        email_found = False
        for sel in email_selectors:
            count = await modal.locator(sel).count()
            if count > 0:
                for i in range(count):
                    if await modal.locator(sel).nth(i).is_visible():
                        email_found = True
                        break
            if email_found:
                break
        assert email_found, "Email input field not found in booking modal"
        
        # -> Verify the modal contains a submit button
        submit_selectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button:has-text("Reservar")',
            'button:has-text("Reservar Cupo")',
            'button:has-text("Enviar")',
            'button:has-text("Confirmar")',
        ]
        submit_found = False
        for sel in submit_selectors:
            count = await modal.locator(sel).count()
            if count > 0:
                for i in range(count):
                    if await modal.locator(sel).nth(i).is_visible():
                        submit_found = True
                        break
            if submit_found:
                break
        assert submit_found, "Submit button not found in booking modal"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    