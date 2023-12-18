Feature: Accessibility

  Scenario: perform accessibility check
    When I open 'https://epam.com' url
    And I perform accessibility check

  Scenario: perform accessibility check and save results
    When I open 'https://epam.com' url
    And I perform accessibility check and save results as 'axeReport'
    Then I expect '$axeReport.violations.length' to equal '0'

