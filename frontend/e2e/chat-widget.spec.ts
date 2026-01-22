import { test, expect } from '@playwright/test';

test.describe('Chat Widget', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for the page to be fully loaded
        await page.waitForLoadState('networkidle');
    });

    test('opens and closes chat window', async ({ page }) => {
        // Initially, chat window should not be visible
        const chatWindow = page.locator('[data-testid="chat-window"]');
        await expect(chatWindow).not.toBeVisible();

        // Click the chat toggle button to open
        const toggleButton = page.locator('[data-testid="chat-toggle-button"]');
        await toggleButton.click();

        // Chat window should now be visible
        await expect(chatWindow).toBeVisible();

        // Click close button to close
        const closeButton = page.locator('[data-testid="chat-close-button"]');
        await closeButton.click();

        // Chat window should be hidden again
        await expect(chatWindow).not.toBeVisible();
    });

    test('sends message and receives response', async ({ page }) => {
        // Open the chat widget
        await page.locator('[data-testid="chat-toggle-button"]').click();
        await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();

        // Type a message
        const messageInput = page.locator('textarea[aria-label*="city services"]');
        await messageInput.fill('What are your hours?');

        // Click send button
        const sendButton = page.locator('button[aria-label*="Send"]');
        await sendButton.click();

        // Wait for the user message to appear
        const userMessage = page.locator('[data-testid="message-user"]').last();
        await expect(userMessage).toContainText('What are your hours?');

        // Wait for the typing indicator and then the response
        // Allow generous timeout for API response
        const assistantMessage = page.locator('[data-testid="message-assistant"]').last();
        await expect(assistantMessage).toBeVisible({ timeout: 30000 });
    });

    test('toggles between English and Spanish', async ({ page }) => {
        // Open the chat widget
        await page.locator('[data-testid="chat-toggle-button"]').click();
        await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();

        // Check initial English placeholder
        const messageInput = page.locator('textarea');
        await expect(messageInput).toHaveAttribute('placeholder', /city services/i);

        // Click ES button to switch to Spanish
        const languageToggle = page.locator('[data-testid="language-toggle"]');
        await languageToggle.locator('button', { hasText: 'ES' }).click();

        // Check Spanish placeholder
        await expect(messageInput).toHaveAttribute('placeholder', /servicios de la ciudad/i);

        // Click EN button to switch back to English
        await languageToggle.locator('button', { hasText: 'EN' }).click();
        await expect(messageInput).toHaveAttribute('placeholder', /city services/i);
    });

    test('clears conversation history', async ({ page }) => {
        // Open the chat widget
        await page.locator('[data-testid="chat-toggle-button"]').click();
        await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();

        // Send a message first
        const messageInput = page.locator('textarea');
        await messageInput.fill('Test message');
        await page.locator('button[aria-label*="Send"]').click();

        // Wait for user message to appear
        await expect(page.locator('[data-testid="message-user"]')).toBeVisible();

        // Click clear button (first click shows confirmation)
        const clearButton = page.locator('[data-testid="clear-chat-button"]');
        await clearButton.click();

        // Click again to confirm
        await clearButton.click();

        // User message should be gone, only welcome message remains
        await expect(page.locator('[data-testid="message-user"]')).not.toBeVisible();

        // Welcome message should still be present
        const welcomeMessage = page.locator('[data-testid="message-assistant"]').first();
        await expect(welcomeMessage).toContainText(/Welcome|Bienvenido/);
    });

    test('voice input button is visible when supported', async ({ page, browserName }) => {
        // Open the chat widget
        await page.locator('[data-testid="chat-toggle-button"]').click();
        await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();

        // Voice button visibility depends on browser support
        // Chromium-based browsers typically support Web Speech API
        const voiceButton = page.locator('button[aria-label*="voice"]');

        if (browserName === 'chromium') {
            // Chrome should show voice button
            await expect(voiceButton).toBeVisible();
        }
        // For other browsers, we just verify the page doesn't error
    });

    test('keyboard navigation works correctly', async ({ page }) => {
        // Open chat with keyboard - Tab to toggle button and press Enter
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab'); // May need multiple tabs to reach toggle

        const toggleButton = page.locator('[data-testid="chat-toggle-button"]');
        await toggleButton.focus();
        await page.keyboard.press('Enter');

        // Chat should be open
        await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();

        // Can type in input
        await page.keyboard.press('Tab');
        const messageInput = page.locator('textarea');
        await messageInput.type('Hello');
        await expect(messageInput).toHaveValue('Hello');

        // Can submit with Enter
        await page.keyboard.press('Enter');

        // Message should be sent (input cleared)
        await expect(messageInput).toHaveValue('');
    });

    test('preserves conversation across page reload', async ({ page }) => {
        // Open the chat widget and send a message
        await page.locator('[data-testid="chat-toggle-button"]').click();

        const messageInput = page.locator('textarea');
        await messageInput.fill('Persistence test message');
        await page.locator('button[aria-label*="Send"]').click();

        // Wait for user message to appear and be saved to localStorage
        await expect(page.locator('[data-testid="message-user"]')).toContainText('Persistence test message');

        // Wait for localStorage save to complete
        await page.waitForTimeout(500);

        // Reload the page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Open chat again
        await page.locator('[data-testid="chat-toggle-button"]').click();

        // Wait for chat window to be visible
        await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();

        // Message should still be there (loaded from localStorage), with extended timeout for hydration
        await expect(page.locator('[data-testid="message-user"]')).toContainText('Persistence test message', { timeout: 10000 });
    });
});

test.describe('Responsive Design', () => {
    test('chat widget works on mobile viewport', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Open chat
        await page.locator('[data-testid="chat-toggle-button"]').click();

        // Chat window should be visible and properly sized
        const chatWindow = page.locator('[data-testid="chat-window"]');
        await expect(chatWindow).toBeVisible();

        // Should be able to type and send
        const messageInput = page.locator('textarea');
        await messageInput.fill('Mobile test');
        await page.locator('button[aria-label*="Send"]').click();

        // Message should appear
        await expect(page.locator('[data-testid="message-user"]')).toContainText('Mobile test');
    });
});
