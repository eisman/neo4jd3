import * as ts from 'typescript';
import * as fs from 'fs';
import {CallExpression, ClassDeclaration, FunctionDeclaration, PropertyAccessExpression} from "typescript";
import * as path from "path";

function getCalls(sourceFile: ts.SourceFile): { [key: string]: string[] } {
    const calls: { [key: string]: string[] } = {};
    const s: string[] = ['__entry__'];

    traverse(sourceFile);

    function traverse(node: ts.Node) {
        switch (node.kind) {
            case ts.SyntaxKind.ClassDeclaration:
                s.push((node as ClassDeclaration).name?.text || '');
                ts.forEachChild(node, traverse);
                s.pop();
                break;
            case ts.SyntaxKind.Constructor:
                s.push('constructor');
                ts.forEachChild(node, traverse);
                s.pop();
                break;
            case ts.SyntaxKind.FunctionDeclaration:
            case ts.SyntaxKind.MethodDeclaration:
                s.push((node as FunctionDeclaration).name?.text || '');
                ts.forEachChild(node, traverse);
                s.pop();
                break;
            case ts.SyntaxKind.CallExpression:
                const caller = s.join('.');
                const callee = (() => {
                    const callExpr = node as CallExpression;

                    if (callExpr.expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
                        const propExpr = callExpr.expression as PropertyAccessExpression;
                        return propExpr.expression.kind == ts.SyntaxKind.ThisKeyword
                            ? `${s.slice(0, s.length - 1).join('.')}.${propExpr.name.text}`
                            : propExpr.getText(sourceFile);
                    } else {
                        return callExpr.expression?.getText(sourceFile);
                    }
                })();

                if (!callee.toString().startsWith('__entry__')) break;

                if (calls.hasOwnProperty(caller)) {
                    calls[caller].push(callee);
                } else {
                    calls[caller] = [callee];
                }

                ts.forEachChild(node, traverse);
                break;
            default:
                ts.forEachChild(node, traverse);
        }
    }

    return calls;
}

function convertToDot(name: string, calls: { [key: string]: string[] }): string {
    const refs = [];

    for (let k in calls) {
        calls[k].forEach(v => {
            refs.push(`    "${k}" -> "${v}"`);
        });
    }

    return `digraph "${name}" {
${refs.join(`;
`)};
}`;
}

const fileName = process.argv[2] || '';
const name = path.basename(fileName);

const sourceFile = ts.createSourceFile(
    name,
    fs.readFileSync(fileName, 'utf8'),
    ts.ScriptTarget.Latest
);

const calls = getCalls(sourceFile);
const dot = convertToDot(name, calls)
console.log(dot);

const outPath = process.argv[3] || '';
fs.writeFileSync(outPath, dot);

