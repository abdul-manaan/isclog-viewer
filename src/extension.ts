import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const provider = new ISCLogProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerCustomEditorProvider(
            ISCLogProvider.viewType,
            provider
        )
    );
}

class ISCLogProvider implements vscode.CustomReadonlyEditorProvider {
    public static readonly viewType = 'iscLogViewer.isclog';

    constructor(private readonly extensionUri: vscode.Uri) {}

    async openCustomDocument(
        uri: vscode.Uri,
        _openContext: vscode.CustomDocumentOpenContext,
        _token: vscode.CancellationToken
    ): Promise<vscode.CustomDocument> {
        return { uri, dispose: () => {} };
    }

    async resolveCustomEditor(
        document: vscode.CustomDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
		try {
			const content = parseISCLog(await vscode.workspace.fs.readFile(document.uri));
			webviewPanel.webview.options = { enableScripts: true };
        	webviewPanel.webview.html = this.getHTMLContent(webviewPanel.webview, content);
		} catch (err) {
			console.error("Error resolving custom editor:", err);
		}
        
    }

    private getHTMLContent(webview: vscode.Webview, content: any[]): string {
        const table = generateHTMLTable(content);
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>ISC Log Viewer</title>
                <style>
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                </style>
            </head>
            <body>
                ${table}
            </body>
            </html>
        `;
    }
}

function parseISCLog(fileContent: Uint8Array): any[] {
    const text = new TextDecoder().decode(fileContent);
	return text.split("\n").map(line => {
		try {
			// Extract the data inside $lb(...)
			const lbContents = line.split("=$lb(");
			if (!lbContents || lbContents.length < 2) return null;
			if (lbContents[0].split(",").length > 2) return null;

			// Split the content by commas and trim quotes
			let lbContent = lbContents[1].trim().slice(0,lbContents[1].trim().length-1);
			const fields = [];
			let currentField = '';
			let inQuotes = false;
			let nestedLevel = 0;

			for (let i = 0; i < lbContent.length; i++) {
				const char = lbContent[i];

				if (char === '"' && lbContent[i - 1] !== '\\') {
					inQuotes = !inQuotes; // Toggle quote status
				} else if (!inQuotes && char === '(') {
					nestedLevel++; // Increment nested level
				} else if (!inQuotes && char === ')') {
					nestedLevel--; // Decrement nested level
				} else if (!inQuotes && nestedLevel === 0 && char === ',') {
					// End of a field
					fields.push(currentField.trim());
					currentField = '';
					continue;
				}

				currentField += char;
			}

			// Push the last field
			if (currentField) {
				fields.push(currentField.trim());
			}

			// Map fields to the corresponding object structure
			return {
				ID: lbContents[0].split(",")[1] || -1,            
				LogLevel: fields[0] || "",
				Category: fields[1] || "",
				Message: fields[2] || "",
				Pid: fields[3] || "",
				Namespace: fields[4] || "",
				TimeAdded: fields[5] || "",
				Routine: fields[6] || "",
				Tag: fields[7] || "",
				SessionId: fields[8] || "",
				ClassName: fields[9] || ""
			};
		} catch (err) {
			console.log("Error while parsing isclog file",err);
			return null;
		}

    }).filter(entry => entry !== null);
    
}

function generateHTMLTable(data: any[]): string {
    // Start the HTML table with headers for all fields
    let html = `<table border="1" cellpadding="5" cellspacing="0">
        <thead>
            <tr>
                <th>ID</th>
                <th>LogLevel</th>
                <th>Category</th>
                <th>Message</th>
                <th>Pid</th>
                <th>Namespace</th>
                <th>TimeAdded</th>
                <th>Routine</th>
                <th>Tag</th>
                <th>SessionId</th>
                <th>ClassName</th>
            </tr>
        </thead>
        <tbody>`;

    // Loop through the data array to create table rows
    data.forEach(row => {
        html += `<tr>
            <td>${row.ID || ""}</td>
            <td>${row.LogLevel || ""}</td>
            <td>${row.Category || ""}</td>
            <td>${row.Message || ""}</td>
            <td>${row.Pid || ""}</td>
            <td>${row.Namespace || ""}</td>
            <td>${row.TimeAdded || ""}</td>
            <td>${row.Routine || ""}</td>
            <td>${row.Tag || ""}</td>
            <td>${row.SessionId || ""}</td>
            <td>${row.ClassName || ""}</td>
        </tr>`;
    });

    // Close the table tags
    html += `</tbody></table>`;
    return html;
}


export function deactivate() {}
