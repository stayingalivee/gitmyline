import { exit } from 'process';
import * as vscode from 'vscode';

const { exec } = require('child_process');

export function getCursorUpstreamPath() {
    
    /*
        origin	git@github.com:stayingalivee/agileafsozlugu.com.git (fetch)
        origin	git@github.com:stayingalivee/agileafsozlugu.com.git (push)

        origin	https://github.com/Trendyol/kafka-konsumer.git (fetch)
        origin	https://github.com/Trendyol/kafka-konsumer.git (push)
     */
    exec('git remote -v', (err: any, stdout: any[], stderr: any) => {
        let str = "origin git@github.com:stayingalivee/agileafsozlugu.com.git (fetch)";

        const url = stdout[0].split(" ")[1];
        let upstreamUrl = parse(url);  
        
        const line = vscode.window.activeTextEditor?.selection.active.line;
        const file = vscode.workspace.workspaceFile?.path;
        
        upstreamUrl += "/" + file + "#L" + line;

        copyToClipboard(upstreamUrl);
        openInBrowser(upstreamUrl);
    });
          
}

function parse(url: string) {
    url = url.replace("git@", "");
    url = url.replace(".git", "");
    url = url.replace(":", "/");
    return url;
}

function copyToClipboard(url: string) {

}

function openInBrowser(url: string) {

}