@home
Feature: Home Page
  As a visitor
  I want to use the storefront home page
  So that I can browse products and core sections safely

  Scenario: TC_001 Home page loads correctly
    Given I am on the home page
    Then I should see all critical home sections

  Scenario: TC_002 Verify page responsiveness
    Given I am on the home page
    When I view the page on mobile tablet and desktop
    Then the layout should remain responsive

  Scenario: TC_003 Verify page load performance
    Given I am on the home page
    Then the page should load within acceptable time

  Scenario: TC_004 Verify logo click behavior
    Given I am on the home page
    Then clicking the logo should keep me on home

  Scenario: TC_005 Verify navigation menu links
    Given I am on the home page
    Then navigation menu links should redirect correctly

  Scenario: TC_006 Verify search bar behavior
    Given I am on the home page
    Then search should return relevant products

  Scenario: TC_007 Verify login register button
    Given I am on the home page
    Then login or register should open auth page

  Scenario: TC_008 Verify cart icon behavior
    Given I am on the home page
    Then cart icon should open cart page

  Scenario: TC_009 Verify banner visibility
    Given I am on the home page
    Then the banner should be visible with content

  Scenario: TC_010 Verify banner auto slide
    Given I am on the home page
    Then banner should auto slide when multiple slides exist

  Scenario: TC_011 Verify banner click navigation
    Given I am on the home page
    Then clicking banner should open linked destination

  Scenario: TC_012 Verify categories visibility
    Given I am on the home page
    Then categories should be visible

  Scenario: TC_013 Verify category click navigation
    Given I am on the home page
    Then clicking a category should open category product page

  Scenario: TC_014 Verify product card listing data
    Given I am on the home page
    Then product cards should show name price and image

  Scenario: TC_015 Verify product click navigation
    Given I am on the home page
    Then clicking a product should open product details

  Scenario: TC_016 Verify add to cart action
    Given I am on the home page
    Then add to cart action should work based on auth rules

  Scenario: TC_017 Verify wishlist action
    Given I am on the home page
    Then wishlist action should work based on auth rules

  Scenario: TC_018 Verify discount and price display
    Given I am on the home page
    Then discounts should be shown correctly

  Scenario: TC_019 Verify deals visibility
    Given I am on the home page
    Then deals section should be visible

  Scenario: TC_020 Verify deals countdown timer
    Given I am on the home page
    Then countdown timer should be functional when available

  Scenario: TC_021 Verify top vendors visibility
    Given I am on the home page
    Then top vendors should be visible when feature is enabled

  Scenario: TC_022 Verify vendor click navigation
    Given I am on the home page
    Then clicking vendor should open vendor shop page

  Scenario: TC_023 Verify footer informational links
    Given I am on the home page
    Then about contact and faq links should redirect correctly

  Scenario: TC_024 Verify footer social links
    Given I am on the home page
    Then social links should point to valid social pages

  Scenario: TC_025 Verify newsletter subscription
    Given I am on the home page
    Then newsletter subscription should show success feedback

  Scenario: TC_026 Verify empty search validation
    Given I am on the home page
    Then empty search should show validation message

  Scenario: TC_027 Verify invalid search no result behavior
    Given I am on the home page
    Then invalid search should show no results feedback

  Scenario: TC_028 Verify unauthorized cart or wishlist behavior
    Given I am on the home page
    Then unauthorized wishlist or cart action should follow auth policy

  Scenario: TC_029 Verify logged in session persistence
    Given I am on the home page
    Then logged in session should persist after refresh

  Scenario: TC_030 Cross-browser compatibility
    Given I am on the home page
    Then behavior should remain consistent on Chrome Firefox and Edge
