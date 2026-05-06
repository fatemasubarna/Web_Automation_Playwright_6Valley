@search
Feature: Search
  As a customer
  I want to search for products
  So that I can find relevant items quickly

  Scenario: Search for an item and verify results
    Given I am on the home page
    When I search for "phone"
    Then search results should include "phone"

  Scenario: Search trims extra spaces and still returns results
    Given I am on the home page
    When I search for "   phone   "
    Then search results should include "phone"

  Scenario: Search for a non-existing product shows empty state (or no results)
    Given I am on the home page
    When I search for "zzzz_no_such_product_12345"
    Then I should see no search results

  Scenario: Case insensitivity returns consistent results
    Given I am on the home page
    When I search for the following keywords:
      | PHONE |
      | Phone |
      | phone |
    Then the top search results should be consistent

  Scenario: Partial match search returns relevant products
    Given I am on the home page
    When I search for "iph"
    Then search results should include "iph"

  Scenario: Special characters handling does not crash
    Given I am on the home page
    When I search for "@#$%"
    Then I should be on the products results page

  Scenario: Numeric search matches numeric product names
    Given I am on the home page
    When I search for "14"
    Then search results should include "14"

  Scenario: Long search input does not break UI
    Given I am on the home page
    When I search for a very long keyword
    Then I should be on the products results page

  Scenario: Search via Enter key triggers results
    Given I am on the home page
    When I search for "phone" using Enter
    Then search results should include "phone"

  Scenario: Search via button click triggers results
    Given I am on the home page
    When I search for "phone" using search button
    Then search results should include "phone"

  Scenario: Empty search submission shows products
    Given I am on the home page
    When I search for "" using search button
    Then I should see some search results

  Scenario: Search result navigation opens product details
    Given I am on the home page
    When I search for "phone"
    And I open the first product result
    Then I should be on a product details page

  Scenario: Result consistency searching twice
    Given I am on the home page
    When I search for "phone"
    And I save the top 5 results
    And I am on the home page
    And I search for "phone"
    Then the top 5 results should match the saved results

  Scenario: Performance: results load within threshold
    Given I am on the home page
    When I search for "phone" within 10 seconds
    Then search results should include "phone"

  Scenario: URL validation contains query param
    Given I am on the home page
    When I search for "phone"
    Then the URL should contain "name=phone"

  Scenario: Search persistence on refresh does not crash
    Given I am on the home page
    When I search for "phone"
    And I refresh the page
    Then I should be on the products results page
