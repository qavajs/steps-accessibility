# @qavajs/steps-accessibility
Steps to perform accessibility checks using axe library.
Library can work on top of playwright and webdriverio drivers

## Installation
`npm install @qavajs/steps-accessibility`

## Configuration
```javascript
module.exports = {
    default: {
        require: [
            'node_modules/@qavajs/steps-wdio', //corresponding driver library should be imported first
            'node_modules/@qavajs/steps-accessibility'
        ],
        // to customize axe instance define axe property which is a function that accepts AxeBuilder instance
        // more info: 
        // https://www.npmjs.com/package/@axe-core/webdriverio
        // https://www.npmjs.com/package/@axe-core/playwright
        axe: function (instance: AxeBuilder) {
            return instance.withTags('wcag2a')
        },
        format: [
            '@qavajs/html-formatter:report.html'
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
