// extension.ts
import * as vscode from 'vscode';
import { ProblemProvider, Problem } from './problemProvider';
import { SolutionValidator } from './solutionValidator';

export function activate(context: vscode.ExtensionContext) {
    const problemProvider = new ProblemProvider();
    const solutionValidator = new SolutionValidator(context.extensionPath);

    // Register problem list view
    const treeView = vscode.window.createTreeView('problemList', {
        treeDataProvider: problemProvider
    });

    // Register practice panel view as Webview Panel
    const sidebarViewProvider = new SidebarViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('programmingPracticeView', sidebarViewProvider)
    );

    // Handle problem selection
    context.subscriptions.push(
        treeView.onDidChangeSelection(event => {
            if (event.selection.length > 0) {
                const selectedProblem = event.selection[0] as Problem;
                sidebarViewProvider.updateProblem(selectedProblem);
            }
        })
    );
}

class SidebarViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _currentProblem?: Problem;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        
        // Configure webview
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        // Set initial HTML content
        webviewView.webview.html = this._getWebviewContent();

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(async message => {
            try {
                switch (message.command) {
                    case 'submit':
                        if (this._currentProblem) {
                            const validator = new SolutionValidator(this._extensionUri.fsPath);                            const result = await validator.validate(this._currentProblem.id, message.code);
                            await this._sendMessageToWebview({
                                command: 'validationResult',
                                success: result.success,
                                message: result.message
                            });
                        }
                        break;
                    case 'ready':
                        if (this._currentProblem) {
                            this.updateProblem(this._currentProblem);
                        }
                        break;
                }
            } catch (error) {
                await this._sendMessageToWebview({
                    command: 'validationResult',
                    success: false,
                    message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
                });
            }
        });
    }

    private async _sendMessageToWebview(message: any) {
        if (this._view) {
            try {
                await this._view.webview.postMessage(message);
            } catch (error) {
                console.error('Failed to send message to webview:', error);
            }
        }
    }

        // extension.ts - 更新updateProblem方法
        public async updateProblem(problem: Problem) {
            this._currentProblem = problem;
            await this._sendMessageToWebview({
                command: 'updateProblem',
                id: problem.id,
                title: problem.label,
                description: problem.fullDescription, // 使用完整描述
                difficulty: problem.difficulty,
                template: await this._getCodeTemplate(problem.id)
            });
        }


        private async _getCodeTemplate(problemId: string): Promise<string> {
            const templates: Record<string, string> = {
                '1': `#include <iostream>
        #include <vector>
        #include "../lib/json.hpp"
        using namespace std;
        using json = nlohmann::json;
        
        int main() {
            // 读取输入数组和目标值
            int n, target;
            cin >> n >> target;
            
            vector<int> nums(n);
            for(int i = 0; i < n; i++) {
                cin >> nums[i];
            }
            
            // 在这里实现你的解决方案
            // 要求：找到两个数的和等于target，返回它们的下标
            
            // 输出结果
            json result = json::array({0, 1});  // 替换成实际找到的下标
            cout << result << endl;
            
            return 0;
        }`,
                '2': `#include <iostream>
        #include <string>
        using namespace std;
        
        int main() {
            int x;
            cin >> x;
            
            // 在这里实现你的解决方案
            // 要求：判断x是否为回文数
            
            // 输出结果
            cout << "true" << endl;  // 或 cout << "false" << endl;
            
            return 0;
        }`,
            };
        
            return templates[problemId] || '';
        }
    private _getWebviewContent() {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
            <title>Programming Practice</title>
            <style>
                body {
                    padding: 8px;
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    font-size: var(--vscode-font-size);
                    line-height: 1.4;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    margin: 0;
                }
                .problem-container {
                    margin-bottom: 12px;
                    flex: 0 0 auto;
                    overflow-y: auto;
                }
                h3 {
                    margin: 0 0 8px 0;
                    font-size: 1.1em;
                    color: var(--vscode-editor-foreground);
                }
                .difficulty {
                    margin: 8px 0;
                    font-size: 0.9em;
                    color: var(--vscode-descriptionForeground);
                }
                .editor-container {
                    margin: 8px 0;
                    flex: 1 1 auto;
                    display: flex;
                    flex-direction: column;
                    min-height: 200px;
                }
                #code-editor {
                    width: 100%;
                    flex: 1 1 auto;
                    min-height: 150px;
                    resize: none;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    padding: 8px;
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: var(--vscode-editor-font-size);
                    line-height: 1.4;
                    tab-size: 4;
                    white-space: pre;
                    overflow: auto;
                }
                .controls-container {
                    margin-top: 12px;
                    padding: 8px;
                    background-color: var(--vscode-sideBar-background);
                    border-top: 1px solid var(--vscode-panel-border);
                    flex: 0 0 auto;
                }
                .submit-button {
                    width: 100%;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    cursor: pointer;
                    font-size: 14px;
                    border-radius: 3px;
                    font-weight: 500;
                    text-align: center;
                }
                .submit-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .submit-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .result-container {
                    margin-top: 8px;
                    padding: 8px;
                    border-radius: 3px;
                    font-size: 0.9em;
                    display: none;
                }
                .result-container.visible {
                    display: block;
                }
                .success {
                    background-color: var(--vscode-testing-passed-background);
                    color: var(--vscode-testing-passed-foreground);
                    border: 1px solid var(--vscode-testing-passed-border);
                }
                .error {
                    background-color: var(--vscode-testing-failed-background);
                    color: var(--vscode-testing-failed-foreground);
                    border: 1px solid var(--vscode-testing-failed-border);
                }
                #problem-description {
                    margin: 8px 0;
                    white-space: pre-wrap;
                    color: var(--vscode-foreground);
                }
            </style>
        </head>
        <body>
            <div class="problem-container">
                <h3 id="problem-title"></h3>
                <div id="problem-description"></div>
                <div class="difficulty">Difficulty: <span id="problem-difficulty"></span></div>
            </div>
            
            <div class="editor-container">
                <textarea id="code-editor" spellcheck="false" placeholder="Write your code here..."></textarea>
            </div>
            
            <div class="controls-container">
                <button id="submit-button" class="submit-button" onclick="submitSolution()">
                    Submit Solution
                </button>
                <div id="validation-result" class="result-container"></div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                let currentProblemId = '';
                
                // Initialize state
                const state = vscode.getState() || { code: '' };
                document.getElementById('code-editor').value = state.code;

                // Notify webview is ready
                vscode.postMessage({ command: 'ready' });
                
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'updateProblem':
                            currentProblemId = message.id;
                            document.getElementById('problem-title').textContent = message.title;
                            document.getElementById('problem-description').textContent = message.description;
                            document.getElementById('problem-difficulty').textContent = message.difficulty;
                            
                            const editor = document.getElementById('code-editor');
                            editor.value = message.template || '';



    

                            
                            // Save initial state
                            vscode.setState({ code: editor.value });
                            
                            // Reset validation result
                            const resultDiv = document.getElementById('validation-result');
                            resultDiv.className = 'result-container';
                            resultDiv.textContent = '';
                            break;
                            
                        case 'validationResult':
                            const resultElement = document.getElementById('validation-result');
                            resultElement.textContent = message.message;
                            resultElement.className = 'result-container visible ' + (message.success ? 'success' : 'error');
                            
                            // Enable/disable submit button
                            document.getElementById('submit-button').disabled = false;
                            break;
                    }
                });
                
                function submitSolution() {
                    const submitButton = document.getElementById('submit-button');
                    const code = document.getElementById('code-editor').value;
                    
                    // Disable submit button while processing
                    submitButton.disabled = true;
                    
                    // Clear previous result
                    const resultDiv = document.getElementById('validation-result');
                    resultDiv.className = 'result-container';
                    resultDiv.textContent = '';
                    
                    vscode.postMessage({
                        command: 'submit',
                        code: code
                    });
                }

                // Handle code editor changes
                document.getElementById('code-editor').addEventListener('input', function(e) {
                    vscode.setState({ code: this.value });
                });

                // Add Tab key support
                document.getElementById('code-editor').addEventListener('keydown', function(e) {
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        const start = this.selectionStart;
                        const end = this.selectionEnd;
                        
                        // Insert 4 spaces
                        this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
                        
                        // Put caret at right position
                        this.selectionStart = this.selectionEnd = start + 4;
                        
                        // Save state
                        vscode.setState({ code: this.value });
                    }
                });
            </script>
        </body>
        </html>`;
    }














}