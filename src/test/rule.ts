import {createPlugin, Plugin, utils} from 'stylelint';

export type Rule = {
    ruleName: string;
    rule: Plugin;
    /**
     * This "message" property isn't normally part of the Rule type but for the simplicity of these
     * tests it is included here.
     */

    message: string;
};

export function createRuleMessage(ruleName: string, message: string): string {
    return utils.ruleMessages(ruleName, {whatever: () => message}).whatever();
}

export function createRule(inputRuleName: string, ruleCallback: Plugin, message: string): Rule {
    const plugin: Rule = {...createPlugin(inputRuleName, ruleCallback), message};
    return plugin;
}
