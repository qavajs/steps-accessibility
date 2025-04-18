# Change Log

All notable changes to the "@qavajs/steps-accessibility" will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [3.1.0]
- added capability to save json results via _saveAs_ property
```gherkin
And I perform accessibility check:
  """
  {
  "saveAs": "results/one/report.json"
  }
  """
```
- added _context_ property to provide context of accessibility analysis
```gherkin
And I perform accessibility check:
  """
  {
    "context": ["[aria-label=\"Expand sidebar category 'Steps'\"]"],
    "runOnly": ["wcag2a"]
  }
  """
```

## [3.0.0]
- moved to common axe-core library
- removed `axe` property configuration
- added step configuration

## [2.0.0]
- release compatible with qavajs2

## [0.4.0]
- :rocket: added new axe reporter
- :rocket: added _I perform accessibility check and save results as {string}_ step
```gherkin
And I perform accessibility check and save results as 'axeReport'
Then I expect '$axeReport.violations.length' to equal '0'
```

## [0.3.0]
- :rocket: updated dependencies

## [0.0.2]
- :beetle: fixed attachment for failed check 

## [0.0.1]
- :rocket: initial implementation
