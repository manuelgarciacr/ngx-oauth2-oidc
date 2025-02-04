import { GlobalData, getData, setData } from "./utils";
import { Rule, SchematicContext, SchematicsException, Tree } from "@angular-devkit/schematics";

export const question = async (
    question: string,
    id: string,
    type: "string" | "boolean",
    defaultAnswer: string | boolean,
    data: GlobalData,
    rules: Rule[]
): Promise<Rule[]> => {
    if (type === "string")
        rules.push(
            questionStringRuleFactory(
                question,
                id,
                defaultAnswer as string,
                data
            )
        );
    else
        rules.push(
            questionBooleanRuleFactory(
                question,
                id,
                defaultAnswer as boolean,
                data
            )
        );
    return rules;
};

export function questionStringRuleFactory(
    question: string,
    id: string,
    _defaultAnswer: string,
    data: GlobalData
): Rule {
    return async (_tree: Tree, _context: SchematicContext) => {
        const readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        return new Promise<void>((res, _rej) => {
            readline.question(
                //`\n\x1b[96m\x1b[1m❔   ${question}\x1b[0m`,
                `\x1b[96m❔   ${question}\x1b[0m`,
                (answer: string) => {
                    setData(data, answer, "questions", id, "value");
                    //console.log("\x1b[2K\x1b[F\x1b[F\x1b[F\x1b[1C"); // \x1b[0J
                    console.log("\x1b[2K\x1b[F\x1b[1C"); // \x1b[0J
                    readline.close();
                    res();
                }
            );
        });
    };
}

export function questionBooleanRuleFactory(
    question: string,
    id: string,
    defaultAnswer: boolean,
    data: GlobalData
): Rule {
    return (_tree: Tree, _context: SchematicContext) => {
        const readline = require("readline");
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);

        return new Promise<void>((res, _rej) => {
            process.stdin.on("keypress", (_str, key) => {
                if (
                    key.name === "y" ||
                    key.name === "n" ||
                    key.name === "return"
                ) {
                    setData(
                        data,
                        key.name === "y"
                            ? true
                            : key.name === "n"
                            ? false
                            : defaultAnswer,
                        "questions",
                        id,
                        "value"
                    );
                    //console.log("\x1b[2K\x1b[F\x1b[F\x1b[F\x1b[1C"); // \x1b[0J
                    console.log("\x1b[2K\x1b[F\x1b[1C"); // \x1b[0J
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    res();
                }
            });

            //process.stdout.write(`\n\x1b[96m\x1b[1m❔   ${question}\x1b[0m`);
            process.stdout.write(`\x1b[96m❔   ${question}\x1b[0m`);
        });
    };
}

export const cancellation = (
    reason: string,
    defaultAnswer: boolean,
    questionId: string,
    data: GlobalData,
    rules: Rule[]
) => {
    rules.push(questionBooleanRuleFactory(
        `${reason}. Do you want to continue? ${defaultAnswer ? "[Y/n]" : "[y/N]"}`,
        questionId,
        defaultAnswer,
        data
    ));

    rules.push(() => {
        const res = getData(data, "questions", questionId, "value");
        if (!res) {
            throw new SchematicsException(`❌  Process cancelled by user.`);
        }
    });
    return rules
};
