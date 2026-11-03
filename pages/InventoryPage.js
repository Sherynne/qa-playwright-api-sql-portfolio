const { expect } = require('@playwright/test');

class InventoryPage {
  constructor(page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  async addToCart(productSlug) {
    await this.page.getByTestId(`add-to-cart-${productSlug}`).click();
  }

  async expectLoaded() {
    await expect(this.title).toHaveText('Products');
    await expect(this.items).toHaveCount(6);
  }

  async openCart() {
    await this.cartLink.click();
  }
}

module.exports = { InventoryPage };
