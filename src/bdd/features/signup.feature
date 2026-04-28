@signup
Feature: Sign Up
  As a new customer
  I want to register an account
  So that I can use customer features

  Scenario: Signup with valid data
    Given I am on the signup page
    When I complete signup with valid generated data
    Then I should be redirected to the storefront

  Scenario: Signup with existing email
    Given I am on the signup page
    When I try to signup with an existing email
    Then I should see email already taken error

  Scenario: Signup with existing phone number
    Given I am on the signup page
    When I try to signup with an existing phone number
    Then I should see phone already taken error

  Scenario: Signup without mandatory data
    Given I am on the signup page
    When I submit the signup form without mandatory fields
    Then signup validation should be shown

  Scenario: Signup without accepting terms
    Given I am on the signup page
    When I fill signup form but do not accept terms
    Then signup should not proceed
