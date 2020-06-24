# Stylelint Rule Tester

_This is not an official [stylelint](https://stylelint.io) package._

Simple function written in TypeScript to test custom stylelint plugin rules.

Largely influenced by [jest-preset-stylelint/getTestRule.js](https://github.com/stylelint/jest-preset-stylelint/blob/769cac42e11f811aac6f59ee6570205910ea98fa/getTestRule.js).

## Usage

This is from [this project's test file](https://github.com/electrovir/stylelint-jest-rule-tester/blob/master/src/test/rules/visibility/visibility.test.ts).

```typescript
import {getTestRule} from 'stylelint-jest-rule-tester';
import {visibilityRule} from './visibility.rule';

const testRule = getTestRule({
    // a plugin must be supplied so that stylelint can find the rule you want to test
    linterOptions: {config: {plugins: ['./dist/test/test-plugins.js']}},
});

testRule({
    ruleName: visibilityRule.ruleName,
    ruleOptions: [true],
    fix: true,
    accept: [
        {
            code: 'a { color: pink; }',
        },
    ],
    reject: [
        {
            code: 'a { color: pink; visibility: hidden; }',
            fixed: 'a { color: pink; }',
            message: 'Try not to use visibility (skeleton/visibility)',
        },
    ],
});
```
