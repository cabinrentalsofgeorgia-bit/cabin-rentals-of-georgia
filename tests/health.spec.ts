import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://frontend-next-topaz.vercel.app';

test('Homepage returns 200', async ({ request }) => {
  const response = await request.get(BASE_URL);
  expect(response.status()).toBe(200);
});
