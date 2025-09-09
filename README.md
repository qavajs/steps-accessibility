# @qavajs/steps-accessibility
qavajs steps to perform accessibility checks using axe library.
Library can work on top of playwright and webdriverio drivers

## Installation
```
npm install @qavajs/steps-accessibility
```

## Configuration
```javascript
module.exports = {
    default: {
        require: [
            'node_modules/@qavajs/steps-wdio/index.js', //corresponding driver library should be imported first
            'node_modules/@qavajs/steps-accessibility/index.js'
        ],
        format: [
            ['@qavajs/html-formatter', 'report.html']
        ],
    }
}
```

## Usage
Lib provides `I perform accessibility check` step that creates axe instance, performs checks and attach html report in base 64 format

```gherkin
Feature: Accessibility

  Scenario: perform accessibility check
    When I open 'https://qavajs.github.io/' url
    And I perform accessibility check
```
