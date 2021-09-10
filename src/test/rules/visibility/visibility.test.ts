import {testRule} from '../../..';
import {visibilityRule} from './visibility.rule';

testRule({
    ruleName: visibilityRule.ruleName,
    description: 'should work primary option in array',
    ruleOptions: [true],
    // a plugin must be supplied so that stylelint can find the rule you want to test
    linterOptions: {config: {plugins: ['./dist/test/plugins.js']}},
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
            message: visibilityRule.message,
        },
    ],
});

testRule({
    ruleName: visibilityRule.ruleName,
    description: 'should work without fix option',
    ruleOptions: [true],
    linterOptions: {config: {plugins: ['./dist/test/plugins.js']}},
    accept: [
        {
            code: 'a { color: pink; }',
        },
    ],
    reject: [
        {
            code: 'a { color: pink; visibility: hidden; }',
            message: visibilityRule.message,
        },
    ],
});

testRule({
    ruleName: visibilityRule.ruleName,
    description: 'should work with only primary option',
    ruleOptions: true,
    linterOptions: {config: {plugins: ['./dist/test/plugins.js']}},
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
            message: visibilityRule.message,
        },
    ],
});

testRule({
    ruleName: visibilityRule.ruleName,
    description: 'should work with primary and secondary option',
    ruleOptions: [true, 'stuff-hoop'],
    linterOptions: {config: {plugins: ['./dist/test/plugins.js']}},
    fix: true,
    accept: [
        {
            code: 'a { color: pink; }',
        },
    ],
    reject: [
        {
            code: 'a { color: pink; visibility: hidden; }',
            fixed: 'a { color: pink; stuff-hoop: hidden; }',
            message: visibilityRule.message,
        },
    ],
});

testRule({
    ruleName: visibilityRule.ruleName,
    description: 'should work with secondary option as an object',
    ruleOptions: [true, {replacement: 'stuff-hoop'}],
    linterOptions: {config: {plugins: ['./dist/test/plugins.js']}},
    fix: true,
    accept: [
        {
            code: 'a { color: pink; }',
        },
    ],
    reject: [
        {
            code: 'a { color: pink; visibility: hidden; }',
            fixed: 'a { color: pink; stuff-hoop: hidden; }',
            message: visibilityRule.message,
        },
    ],
});
