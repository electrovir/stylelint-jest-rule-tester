import {Plugin, utils} from 'stylelint';
import {createRule, createRuleMessage} from '../../rule';

/*
Example rule influenced by
https://www.codementor.io/@rudolfolah/stylelint-rules-how-to-write-your-own-rules-hhmwikafq
*/

const ruleName = 'stylelint-jest-rule-tester/visibility';

const message = createRuleMessage(ruleName, 'Try to not use visibility');

const rule: Plugin = (
    primaryOption,
    secondaryOption,
    context = {
        fix: false,
    },
) => {
    return (root, result) => {
        if (!primaryOption) {
            return;
        }

        root.walkDecls(decl => {
            if (decl.prop === 'visibility') {
                if (context.fix) {
                    if (secondaryOption) {
                        let replacementString = '';
                        if (typeof secondaryOption === 'string') {
                            replacementString = secondaryOption;
                        } else {
                            const replacementPropertyName = (secondaryOption as any)?.replacement;
                            if (typeof replacementPropertyName === 'string') {
                                replacementString = replacementPropertyName;
                            }
                        }
                        if (replacementString) {
                            const replacementDeclaration = decl.clone();
                            replacementDeclaration.prop = replacementString;
                            decl.replaceWith(replacementDeclaration);
                            return;
                        }
                    }

                    decl.remove();
                    return;
                }

                utils.report({
                    result,
                    ruleName,
                    message: message,
                    node: decl,
                    word: decl.value,
                });
            }
        });
    };
};

export const visibilityRule = createRule(ruleName, rule, message);
