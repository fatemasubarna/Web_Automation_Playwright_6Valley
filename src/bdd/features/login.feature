@login
Feature: Login
  As a customer
  I want to sign in and recover access reliably
  So that authentication works for different real-world flows

  Scenario: Password field is masked
    Given I am on the login page
    Then the password field should be masked

  Scenario: Login without data shows reclearquired field validation
    Given I am on the login page
    When I submit the login form without entering credentials
    Then I should see browser required validation on the identity field

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I login with valid customer credentials
    Then I should be redirected to the storefront

  Scenario: Login with invalid password shows an error
    Given I am on the login page
    When I login with invalid password credentials
    Then I should see a credentials error message

  Scenario: Remember me keeps credentials after logout
    Given I am on the login page
    When I login with remember me enabled
    And I logout from the account menu
    Then I should see previous login credentials prefilled

  Scenario: Forgot password sends reset OTP for existing phone
    Given I am on the login page
    When I request password reset for an existing account phone
    Then I should land on password reset verification page
    And I should see password reset OTP sent confirmation

  Scenario: Forgot password form opens correctly
    Given I am on the login page
    When I open the forgot password form
    Then I should see forgot password form fields

  Scenario: Forgot password works with dynamic phone data
    Given I am on the login page
    When I request password reset with a generated phone number
    Then I should land on password reset verification page
    And I should see password reset OTP sent confirmation
    And I should see the masked generated phone suffix

  Scenario: Existing user can login via OTP
    Given I am on the login page
    When I request OTP login for existing user
    And I verify OTP code "123456"
    Then I should be redirected to the storefront

  Scenario: New user can login via OTP and update profile
    Given I am on the login page
    When I request OTP login for new user
    And I verify OTP code "123456"
    And I submit generated profile info
    Then I should be redirected to the storefront
