import { stringify } from 'querystring';
import * as vscode from 'vscode';

const { exec } = require('child_process');
const debugChannel = vscode.window.createOutputChannel("gitmylineChannel");

export function getCursorUpstreamPath() {
    const folder = <string> vscode.workspace.workspaceFolders?.[0].uri.fsPath.replace("file://", "")
    const file =  (<string> vscode.window.activeTextEditor?.document.fileName)?.substring(folder.length)
    const line = (<number> vscode.window.activeTextEditor?.selection.active.line) + 1

    debugChannel.appendLine(folder)
    debugChannel.appendLine(file)
    debugChannel.appendLine(String(line))

    const command = ["(cd", folder, ";", "git remote -v)"].join(" ")
    exec(command, (err: any, stdout: any, stderr: any) => {
        const upstreamProjectUrl = parse(stdout.split("\t")[1].split(" ")[0])
        const upstreamCursorPath = getFullPath(upstreamProjectUrl, file, line)

        openInBrowser(upstreamCursorPath)
    });
}

function parse(url: string) {
    return url.replace(":", "/").replace("git@", "https://").replace(".git", "")
}

function getFullPath(upstreamUrl: string, file: string, line: number) {
    const blobPrefix = upstreamUrl.includes("gitlab") ? "/-" : ""
    return upstreamUrl += blobPrefix+ "/blob/main" + file + "#L" + line;
}

function openInBrowser(url: string) {
    // TODO: add linux and windows support
    exec('open ' + url, (err: any, stdout: any[], stderr: any) => {
        console.log(err)    
        console.log(stdout)    
        console.log(stderr)    
    })
}