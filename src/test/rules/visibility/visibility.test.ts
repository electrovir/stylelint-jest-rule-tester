import {testRule} from '../../..';
import {visibilityRule} from './visibility.rule';

testRule({
    ruleName: visibilityRule.ruleName,
    ruleOptions: [true],
    linterOptions: {config: {plugins: ['./dist/test/test-plugins.js']}},
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
