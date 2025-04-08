Feature: Accessibility

  Scenario: perform accessibility check
    When I open 'https://qavajs.github.io/docs/intro' url
    And I perform accessibility check:
    """
    {
      "runOnly": ["wcag2a"]
    }
    """

  Scenario: perform accessibility check and save results
    When I open 'https://qavajs.github.io/docs/intro' url
    And I perform accessibility check and save results as 'axeReport':
    """
    {
      "runOnly": ["wcag2a"]
    }
    """
    Then I expect '$axeReport.violations.length' to equal '0'

  Scenario: perform accessibility check of particular scope
    When I open 'https://qavajs.github.io/docs/intro' url
    And I perform accessibility check:
    """
    {
      "context": ["[aria-label=\"Expand sidebar category 'Steps'\"]"],
      "runOnly": ["wcag2a"]
    }
    """