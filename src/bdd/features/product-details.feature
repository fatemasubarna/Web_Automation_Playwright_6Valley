@productDetails
Feature: Product Details
  As a customer
  I want to view product details
  So that I can decide to purchase confidently

  Background:
    Given I am on the home page

  # 1. Page Load & Basic UI
  Scenario: Product details page loads and shows basic UI
    When I open product details for "phone" from search results
    Then the product details page should load without error
    And the product title should be visible
    And the product image should be visible
    And the product unit price should be visible
    And "Buy Now" and "Add to Cart" should be enabled if present
    And the URL should contain "/product/"

  # 2. Product Information Validation (best-effort: compare list vs details)
  Scenario: Title matches the selected product from the list (best-effort)
    When I open product details for "phone" from search results and remember the selected product
    Then the product title should match the selected product title

  # 3. Discount / Original Price
  Scenario: Discount/original price shape is consistent if discount is present
    When I open product details for "phone" from search results
    Then discounted and original price should be consistent if present

  # 4. Product Image Gallery
  Scenario: Clicking a thumbnail updates the main image (if gallery exists)
    When I open product details for "phone" from search results
    Then thumbnail images should update the main image if present

  # 5. Quantity Selector
  Scenario: Quantity cannot go below 1 (if quantity selector exists)
    When I open product details for "phone" from search results
    And I try to set quantity to 0 on product details
    Then quantity should not go below 1 if present

  # 6. Add to Cart
  Scenario: Add to cart adds product successfully (toast/cart badge)
    When I open product details for "phone" from search results
    And I add the product to the cart from product details
    Then the cart should be updated

  # 7. Buy Now
  Scenario: Buy now redirects to checkout or cart (or requires login)
    When I open product details for "phone" from search results
    And I click buy now on product details
    Then buy now should proceed to checkout or show a blocking modal

  # 8. Wishlist / Favorite
  Scenario: Wishlist action either succeeds or requires login
    When I open product details for "phone" from search results
    And I click wishlist on product details
    Then wishlist should be updated or login should be required

  # 9. Product Description Section
  Scenario: Description expands via See More if available
    When I open product details for "phone" from search results
    And I expand the product description if available
    Then product description content should be visible

  # 10. Tabs Functionality (Overview / Reviews)
  Scenario: Tabs switch (Overview/Reviews) without breaking UI if present
    When I open product details for "phone" from search results
    And I open the "Overview" tab on product details if present
    And I open the "Reviews" tab on product details if present
    Then the tab content should load without breaking UI

  # 11. Vendor Information
  Scenario: Vendor section and chat behavior (best-effort)
    When I open product details for "phone" from search results
    Then vendor details should be visible if present
    When I click chat with vendor on product details if present
    Then chat should open or login should be required

  # 12. Similar Products Section
  Scenario: Similar products navigate to another product details page (if available)
    When I open product details for "phone" from search results
    And I open a similar product if present
    Then I should be on a product details page

  # 13. Navigation Behavior
  Scenario: Refresh keeps same product and back returns to products page
    When I open product details for "phone" from search results
    And I refresh the page
    Then I should be on a product details page
    When I go back in the browser
    Then I should be on the products results page

  # 14. Error Handling
  Scenario: Invalid product URL shows error/404 message
    When I open an invalid product details URL
    Then I should see a 404 page or an error message
