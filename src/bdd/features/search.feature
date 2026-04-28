@search
Feature: Search
  As a customer
  I want to search for products
  So that I can find relevant items quickly

  Scenario: Search for an item and verify results
    Given I am on the home page
    When I search for "phone"
    Then search results should include "phone"
