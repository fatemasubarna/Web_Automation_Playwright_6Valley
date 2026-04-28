@home
Feature: Home Page
  As a visitor
  I want to access the storefront home page
  So that I can see key homepage sections

  Scenario: Home page loads correctly
    Given I am on the home page
    Then I should see the main banner
    And I should see the Flash Deal section
    And I should see the Featured products section

  Scenario: Flash deal visibility check
    Given I am on the home page
    Then flash deal section visibility should be validated
