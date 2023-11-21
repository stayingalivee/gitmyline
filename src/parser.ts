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

        debugChannel.appendLine("error on executing git remote " + err)
        debugChannel.appendLine("stdout: " + stdout)
        debugChannel.appendLine("stderr: " + stderr)

        const upstreamProjectUrl = parse(stdout.split("\t")[1].split(" ")[0])
        const upstreamCursorPath = getFullPath(upstreamProjectUrl, file, line)

        debugChannel.appendLine("upstream : " + upstreamProjectUrl)
        debugChannel.appendLine("upstream line path: " + upstreamCursorPath)

        openInBrowser(upstreamCursorPath)
    });
}

function parse(url: string) {
    
    // possible remote urls
    // git@github.com:username/project.git
    // https://github.com/username/project.git
    let parsedUrl = url

    if(url.startsWith("git")){
        parsedUrl = parsedUrl.replace(":", "/").replace("git@", "https://")
    } 

    return parsedUrl.replace(".git", "")
}

function getFullPath(upstreamUrl: string, file: string, line: number) {
    const blobPrefix = upstreamUrl.includes("gitlab") ? "/-" : ""
    return upstreamUrl += blobPrefix+ "/blob/main" + file + "#L" + line;
}

function openInBrowser(url: string) {
    debugChannel.appendLine("opening url...")    

    const plat = process.platform.toLowerCase()
    if(plat == "darwin") {
        _exec("open", url)
    }else if(plat == "linux") {
        _exec("xdg-open", url)
    }else if(plat == "win32") {
        _execWithShell("Start-Process", {'shell':'powershell.exe'}, url)
    }
    
}

function _exec(command: string, url: string) {
    exec([command, url].join(" "), (err: any, stdout: any, stderr: any) => {
        debugChannel.appendLine(err)    
        debugChannel.appendLine(stdout)    
        debugChannel.appendLine(stderr)    
    })
}

function _execWithShell(command: string, shell: Object, url: string) {
    exec([command, url].join(" "), shell, (err: any, stdout: any, stderr: any) => {
        debugChannel.appendLine(err)    
        debugChannel.appendLine(stdout)    
        debugChannel.appendLine(stderr)    
    })
}