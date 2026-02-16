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
        await page.wait_for_load_state("networkidle")
        # Verify hero / logo text is visible
        assert await page.locator("text=Lagunita Health Club").is_visible()
        assert await page.locator("text=Tu bienestar empieza aquí").is_visible()
        # Verify day selector buttons are present
        days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
        for d in days:
            assert await page.locator(f"text={d}").is_visible()
        # Verify at least one class card is displayed with a class name and a time
        class_names = ["Yoga", "Spinning", "STEP", "TRX"]
        time_candidates = ["07:00", "08:00", "19:30"]
        found = False
        for name in class_names:
            loc = page.locator(f"text={name}")
            count = await loc.count()
            if count:
                for i in range(count):
                    text = (await loc.nth(i).text_content()) or ""
                    for t in time_candidates:
                        if t in text:
                            found = True
                            break
                    if found:
                        break
            if found:
                break
        assert found, "No class card with a class name and time was found on the schedule page"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    