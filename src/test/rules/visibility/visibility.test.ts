import {getTestRuleFunction} from '../../..';
import {visibilityRule} from './visibility.rule';

const testRule = getTestRuleFunction({
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
