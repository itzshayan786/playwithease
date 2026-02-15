const axios = require('axios');

// Mocking the interaction. In reality, you use specific API endpoints provided by the supplier.
class SupplierService {
  constructor() {
    this.baseUrl = process.env.SUPPLIER_API_URL; // e.g., https://api.codeswholesale.com/v2
    this.apiKey = process.env.SUPPLIER_API_KEY;
  }

  /**
   * Fetches the current stock and price from the supplier
   * to update our local DB prices dynamically.
   */
  async getProductDetails(supplierProductId) {
    try {
      // REAL CALL EXAMPLE:
      // const response = await axios.get(`${this.baseUrl}/products/${supplierProductId}`, {
      //   headers: { Authorization: `Bearer ${this.apiKey}` }
      // });
      // return response.data;

      // MOCK RETURN for development:
      return {
        stock: 50,
        currentCost: 35.00 // The price the supplier charges YOU
      };
    } catch (error) {
      console.error("Supplier API Error:", error);
      throw new Error("Failed to fetch product from supplier");
    }
  }

  /**
   * This executes when a user actually pays.
   * We buy the key from the supplier instantly.
   */
  async purchaseKey(supplierProductId) {
    console.log(`Buying key for ${supplierProductId} from supplier...`);
    
    // In a real app, this POST request buys the key and returns the code string.
    // const response = await axios.post(`${this.baseUrl}/orders`, { productId: supplierProductId });
    
    // Mock returned key
    return "XXXX-YYYY-ZZZZ-AAAA"; 
  }
}

module.exports = new SupplierService();