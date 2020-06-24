import {getTestRule, TestRuleInput} from '../../..';
import {visibilityRule} from './visibility.rule';

export const testRule: (options: TestRuleInput) => void = getTestRule({
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
