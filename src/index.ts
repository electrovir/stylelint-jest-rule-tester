import {lint, LinterOptions, LintResult} from 'stylelint';
import {inspect} from 'util';

/*
This file is largely based on
https://github.com/stylelint/jest-preset-stylelint/blob/769cac42e11f811aac6f59ee6570205910ea98fa/getTestRule.js
which has the following license:

The MIT License (MIT)

Copyright (c) 2018 - present stylelint

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

export type TestRuleInput<RuleOptions> = {
    ruleName: string;
    ruleOptions: RuleOptions;
    accept: TestCase[];
    reject: RejectTestCase[];
    fix?: boolean;
    description?: string;

    linterOptions?: Partial<LinterOptions>;
};

export type TestCase = {
    code: string;
    description?: string;
    skipThisTest?: boolean;
    onlyRunThisTest?: boolean;
};

export type RejectTestCase = TestCase &
    Partial<WarningMessage> & {
        message: string;
        fixed?: string;
        unfixable?: boolean;
        warnings?: WarningMessage[];
    };

export type WarningMessage = {
    message: string;
    line: number;
    column: number;
};

async function getSingleLintResult(options: Partial<LinterOptions>): Promise<LintResult> {
    const {
        results: [result],
    } = await lint(options);

    if (!result) {
        throw new Error(`Didn't find single lint result for single lint input.`);
    }

    return result;
}

export function testRule<RuleOptionsType>(testRuleInput: TestRuleInput<RuleOptionsType>) {
    describe(testRuleInput.ruleName, () => {
        const ruleLinterOptions: Partial<LinterOptions> = {
            ...testRuleInput.linterOptions,
            config: {
                ...testRuleInput.linterOptions?.config,
                rules: {
                    [testRuleInput.ruleName]: testRuleInput.ruleOptions,
                },
            },
        };

        setupTestCases(
            'accept',
            testRuleInput.accept,
            testRuleInput.ruleOptions,
            (testCase) => async () => {
                const testCaseLinterOptions: Partial<LinterOptions> = {
                    ...ruleLinterOptions,
                    code: testCase.code,
                };

                const result = await getSingleLintResult(testCaseLinterOptions);

                expect(result.warnings).toHaveLength(0);
                if ((result as any).parseErrors.length) {
                    console.error('parse errors', (result as any).parseErrors);
                }
                expect((result as any).parseErrors).toHaveLength(0);

                // fix shouldn't change code in an "accept" test
                if (testRuleInput.fix) {
                    const fixedResult = await getSingleLintResult({
                        ...testCaseLinterOptions,
                        fix: true,
                    });

                    const fixedCode = getOutputCss(fixedResult);

                    expect(fixedCode).toBe(testCase.code);
                }
            },
            testRuleInput.description,
        );

        setupTestCases(
            'reject',
            testRuleInput.reject,
            testRuleInput.ruleOptions,
            (testCase) => async () => {
                const testCaseLinterOptions: Partial<LinterOptions> = {
                    ...ruleLinterOptions,
                    code: testCase.code,
                };

                const result = await getSingleLintResult(testCaseLinterOptions);

                const actualWarnings = result.warnings;

                if ((result as any).parseErrors.length) {
                    console.log('parse errors', (result as any).parseErrors);
                }
                expect((result as any).parseErrors).toHaveLength(0);
                expect(actualWarnings).toHaveLength(
                    testCase.warnings ? testCase.warnings.length : 1,
                );

                ((testCase.warnings || [testCase]) as Partial<WarningMessage>[]).forEach(
                    (expectedMessage, index) => {
                        const actualWarning = actualWarnings[index];

                        if (!actualWarning) {
                            throw new Error(
                                `Actual warning index not found: ${index} with message ${expectedMessage}`,
                            );
                        }

                        expect(expectedMessage.message).toBeTruthy();
                        expect(actualWarning.text).toBe(expectedMessage.message);

                        if (expectedMessage.line != undefined) {
                            expect(actualWarning.line).toBe(expectedMessage.line);
                        }

                        if (expectedMessage.column != undefined) {
                            expect(actualWarning.column).toBe(expectedMessage.column);
                        }
                    },
                );

                if (!testRuleInput.fix) {
                    return;
                }

                // Check that --fix doesn't change code
                if (testRuleInput.fix && testCase.fixed == undefined && !testCase.unfixable) {
                    throw new Error(
                        `If "fix" is set to true, all reject cases must have fixed: '<fixed-code>' property.`,
                    );
                }

                const fixResult = await getSingleLintResult({...testCaseLinterOptions, fix: true});

                const fixedCode = getOutputCss(fixResult);

                if (testCase.unfixable) {
                    // can't fix
                    if (testCase.fixed != undefined) {
                        expect(fixedCode).toBe(testCase.fixed);
                    }

                    expect(fixedCode).toBe(testCase.code);
                } else {
                    expect(fixedCode).toBe(testCase.fixed);
                    expect(fixedCode).not.toBe(testCase.code);
                }

                // Checks whether only errors other than those fixed are reported
                const lintFixedCodeResult = await getSingleLintResult({
                    ...testCaseLinterOptions,
                    code: fixedCode,
                });

                expect(lintFixedCodeResult.warnings).toEqual(fixResult.warnings);
                if ((lintFixedCodeResult as any).parseErrors.length) {
                    console.log('parse errors', (lintFixedCodeResult as any).parseErrors);
                }
                expect((lintFixedCodeResult as any).parseErrors).toHaveLength(0);
            },
            testRuleInput.description,
        );
    });
}

function setupTestCases<RuleOptions>(
    testType: 'reject',
    cases: RejectTestCase[],
    ruleOptions: RuleOptions,
    testCallback: (testCase: RejectTestCase) => jest.ProvidesCallback,
    backupDescription?: string,
): void;
function setupTestCases<RuleOptions>(
    testType: 'accept',
    cases: TestCase[],
    ruleOptions: RuleOptions,
    testCallback: (testCase: TestCase) => jest.ProvidesCallback,
    backupDescription?: string,
): void;
function setupTestCases<RuleOptions>(
    testType: 'accept' | 'reject',
    cases: TestCase[] | RejectTestCase[],
    ruleOptions: RuleOptions,
    testCallback:
        | ((testCase: TestCase) => jest.ProvidesCallback)
        | ((testCase: RejectTestCase) => jest.ProvidesCallback),
    backupDescription?: string,
): void {
    if (cases.length) {
        describe(testType, () => {
            cases.forEach((testCase) => {
                const itTest = testCase.onlyRunThisTest
                    ? it.only
                    : testCase.skipThisTest
                    ? it.skip
                    : it;

                describe(inspect(ruleOptions), () => {
                    describe(testCase.code, () => {
                        itTest(
                            testCase.description || backupDescription || 'no description',
                            testCallback(testCase as RejectTestCase),
                        );
                    });
                });
            });
        });
    }
}

function getOutputCss(result: LintResult): string {
    const postCssResult = (result as any)._postcssResult;
    const css = postCssResult.root.toString(postCssResult.opts.syntax);

    return css;
}
