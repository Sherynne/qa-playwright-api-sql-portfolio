const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { InventoryPage } = require('../../pages/InventoryPage');
const { CheckoutPage } = require('../../pages/CheckoutPage');

const BACKPACK = 'sauce-labs-backpack';

test.describe('Login', () => {
  let login;

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.goto();
  });

  test('valid user lands on the products page', async ({ page }) => {
    await login.login('standard_user', 'secret_sauce');
    await new InventoryPage(page).expectLoaded();
  });

  test('locked out user sees an error', async () => {
    await login.login('locked_out_user', 'secret_sauce');
    await login.expectError('locked out');
  });

  test('wrong password sees an error', async () => {
    await login.login('standard_user', 'not-the-password');
    await login.expectError('do not match');
  });

  test('empty username sees a required-field error', async () => {
    await login.login('', 'secret_sauce');
    await login.expectError('Username is required');
  });

  test('empty password sees a required-field error', async () => {
    await login.login('standard_user', '');
    await login.expectError('Password is required');
  });

  test('products page cannot be opened without logging in', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
    await login.expectError('You can only access');
  });
});

test.describe('Cart and checkout', () => {
  let inventory;
  let checkout;

  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    inventory = new InventoryPage(page);
    checkout = new CheckoutPage(page);
    await login.goto();
    await login.login('standard_user', 'secret_sauce');
    await inventory.expectLoaded();
  });

  test('adding an item updates the cart badge', async () => {
    await inventory.addToCart(BACKPACK);
    await expect(inventory.cartBadge).toHaveText('1');
  });

  test('checkout happy path completes the order', async () => {
    await inventory.addToCart(BACKPACK);
    await inventory.openCart();
    await checkout.start();
    await checkout.fillDetails('Nicole', 'Nyagah', '00100');
    await checkout.finish();
    await checkout.expectOrderComplete();
  });

  test('checkout without first name shows an error', async () => {
    await inventory.addToCart(BACKPACK);
    await inventory.openCart();
    await checkout.start();
    await checkout.fillDetails('', 'Nyagah', '00100');
    await expect(checkout.error).toContainText('First Name is required');
  });

  test('checkout without postal code shows an error', async () => {
    await inventory.addToCart(BACKPACK);
    await inventory.openCart();
    await checkout.start();
    await checkout.fillDetails('Nicole', 'Nyagah', '');
    await expect(checkout.error).toContainText('Postal Code is required');
  });
});
