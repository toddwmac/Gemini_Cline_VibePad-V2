document.addEventListener('DOMContentLoaded', () => {
    // Null check for all DOM elements
    const elements = [
        'editor', 'preview', 'bold', 'italic', 'h1', 'h2', 'h3', 
        'link', 'env-dropdown', 'exportPdf'
    ];
    
    const domElements = {};
    for (const id of elements) {
        domElements[id] = document.getElementById(id);
        if (!domElements[id]) {
            console.error(`Element with ID '${id}' not found`);
        }
    }
    
    // Alias for easier access
    const editor = domElements['editor'];
    const preview = domElements['preview'];
    const boldBtn = domElements['bold'];
    const italicBtn = domElements['italic'];
    const h1Btn = domElements['h1'];
    const h2Btn = domElements['h2'];
    const h3Btn = domElements['h3'];
    const linkBtn = domElements['link'];
    const envDropdown = domElements['env-dropdown'];
    
    // Skip initialization if critical elements are missing
    if (!editor || !envDropdown) {
        console.error('Critical elements missing, skipping initialization');
        return;
    }
    
    // Syntax mapping for different environments
    const syntaxMap = {
        standard: {
            bold: { start: '**', end: '**' },
            italic: { start: '*', end: '*' },
            strikethrough: { start: '~~', end: '~~' },
            headings: true,
            links: true,
            images: true,
            lists: true,
            code: true,
            tables: true
        },
        github: {
            bold: { start: '**', end: '**' },
            italic: { start: '_', end: '_' },
            strikethrough: { start: '~~', end: '~~' },
            headings: true,
            links: true,
            images: true,
            lists: true,
            code: true,
            tables: true,
            taskLists: true,
            mentions: true
        },
        whatsapp: {
            bold: { start: '*', end: '*' },
            italic: { start: '_', end: '_' },
            strikethrough: { start: '~', end: '~' },
            monospace: { start: '`', end: '`' },
            headings: false,
            links: true,
            images: false,
            lists: false,
            code: false,
            tables: false
        },
        slack: {
            bold: { start: '*', end: '*' },
            italic: { start: '_', end: '_' },
            strikethrough: { start: '~', end: '~' },
            code: { start: '`', end: '`' },
            blockCode: { start: '```', end: '```' },
            headings: false,
            links: true,
            images: false,
            lists: false,
            tables: false
        },
        discord: {
            bold: { start: '**', end: '**' },
            italic: { start: '*', end: '*' },
            boldItalic: { start: '***', end: '***' },
            underline: { start: '__', end: '__' },
            strikethrough: { start: '~~', end: '~~' },
            spoiler: { start: '||', end: '||' },
            headings: false,
            links: true,
            images: false,
            lists: false,
            tables: false
        },
        reddit: {
            bold: { start: '**', end: '**' },
            italic: { start: '*', end: '*' },
            strikethrough: { start: '~~', end: '~~' },
            superscript: { start: '^(', end: ')' },
            headings: false,
            links: true,
            images: false,
            lists: false,
            tables: true
        }
    };

    // Undo stack
    let undoStack = [];
    let undoPointer = -1;
    const MAX_UNDO_STEPS = 20;
    
    // Remove any existing environment setting to ensure Standard is default
    localStorage.removeItem('mdEnv');
    
    // Current environment - now always defaults to Standard
    let currentEnv = 'standard';
    
    // Environment display names
    const envDisplayNames = {
        standard: "Standard",
        github: "GitHub",
        whatsapp: "WhatsApp",
        slack: "Slack",
        discord: "Discord",
        reddit: "Reddit"
    };

    // Update UI based on current environment
    function updateUIForEnvironment() {
        const env = syntaxMap[currentEnv];
        
        // Button enable/disable
        if (boldBtn) boldBtn.disabled = !env.bold;
        if (italicBtn) italicBtn.disabled = !env.italic;
        if (linkBtn) linkBtn.disabled = !env.links;
        
        // Headings dropdown visibility
        if (h1Btn && h1Btn.parentElement && h1Btn.parentElement.parentElement) {
            h1Btn.parentElement.parentElement.style.display = env.headings ? '' : 'none';
        }
        
        // Table dropdown visibility
        const tableDropdown = document.querySelector('.dropdown[data-tooltip="Insert Table"]');
        if (tableDropdown) {
            tableDropdown.style.display = env.tables ? '' : 'none';
        }
        
        // Update dropdown button text to show current environment
        const envButton = document.querySelector('.dropdown button[data-tooltip="Markdown Environment"]');
        if (envButton) {
            envButton.textContent = envDisplayNames[currentEnv] + ' ▼';
        }
        
        // Update preview header environment label
        const envLabel = document.getElementById('current-env-label');
        if (envLabel) {
            envLabel.textContent = envDisplayNames[currentEnv];
        }
        
        // Add warning explanation to preview header
        const warningHelp = document.getElementById('warning-help');
        if (warningHelp) {
            warningHelp.textContent = `⚠️ = formatting not supported in ${envDisplayNames[currentEnv]}`;
        }
        
        // Refresh preview to update warnings
        updatePreview();
    }
    
    // Save editor state to undo stack
    function saveState() {
        const state = {
            value: editor.value,
            selectionStart: editor.selectionStart,
            selectionEnd: editor.selectionEnd
        };
        
        undoStack = undoStack.slice(0, undoPointer + 1);
        undoStack.push(state);
        if (undoStack.length > MAX_UNDO_STEPS) {
            undoStack.shift();
        }
        undoPointer = undoStack.length - 1;
    }
    
    // Undo functionality
    function undo() {
        if (undoPointer > 0) {
            undoPointer--;
            const state = undoStack[undoPointer];
            editor.value = state.value;
            editor.selectionStart = state.selectionStart;
            editor.selectionEnd = state.selectionEnd;
            updatePreview();
        }
    }
    
    // Initialize UI
    updateUIForEnvironment();
    
    // Save state on input
    editor.addEventListener('input', () => {
        saveState();
        updatePreview();
    });
    
    // Ctrl+Z handler
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
        }
    });
    
    // Environment switching with proper dropdown behavior
    envDropdown.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            currentEnv = e.target.dataset.env;
            console.log('Environment changed to:', currentEnv);
            localStorage.setItem('mdEnv', currentEnv);
            updateUIForEnvironment();
        }
    });

    // Dropdown toggle and close behavior
    const envButton = document.querySelector('.dropdown button[data-tooltip="Markdown Environment"]');
    envButton.addEventListener('click', (e) => {
        e.stopPropagation();
        envDropdown.style.display = envDropdown.style.display === 'block' ? 'none' : 'block';
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown') && envDropdown.style.display === 'block') {
            envDropdown.style.display = 'none';
        }
    });
    
    envDropdown.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            currentEnv = e.target.dataset.env;
            console.log('Environment changed to:', currentEnv);
            localStorage.setItem('mdEnv', currentEnv);
            updateUIForEnvironment();
            envDropdown.style.display = 'none'; // Close after selection
            updatePreview(); // Force preview refresh
        }
    });
    const tableDropdown = document.getElementById('table-dropdown');
    const addRowBtn = document.getElementById('addRow');
    const deleteRowBtn = document.getElementById('deleteRow');
    const themeToggle = document.getElementById('themeToggle');
    const copyMarkdownBtn = document.getElementById('copyMarkdown');
    const copyTextBtn = document.getElementById('copyText');
    const copyRtfBtn = document.getElementById('copyRtf');
    const copyHtmlBtn = document.getElementById('copyHtml');
    const exportPdfBtn = document.getElementById('exportPdf');
    const saveBtn = document.getElementById('save');
    const loadBtn = document.getElementById('load');
    const clearBtn = document.getElementById('clear');
    const cheatSheetBtn = document.getElementById('cheatSheet');
    const cheatSheetModal = document.getElementById('cheatSheetModal');
    const closeCheatSheet = document.querySelector('#cheatSheetModal .close');
    const refreshPreviewBtn = document.getElementById('refreshPreview');

    function updatePreview() {
        try {
            const env = syntaxMap[currentEnv];
            const envName = envDisplayNames[currentEnv];
            let html = marked.parse(editor.value);
            
            // Add warnings for unsupported features
            if (!env.headings) html = html.replace(/<h[1-6]/g, '<span class="unsupported-warning" title="Headings not supported in ' + envName + '">⚠️</span><h');
            if (!env.links) html = html.replace(/<a /g, '<span class="unsupported-warning" title="Links not supported in ' + envName + '">⚠️</span><a ');
            if (!env.images) html = html.replace(/<img /g, '<span class="unsupported-warning" title="Images not supported in ' + envName + '">⚠️</span><img ');
            if (!env.lists) html = html.replace(/<[uo]l/g, '<span class="unsupported-warning" title="Lists not supported in ' + envName + '">⚠️</span><$&');
            if (!env.tables) html = html.replace(/<table/g, '<span class="unsupported-warning" title="Tables not supported in ' + envName + '">⚠️</span><table');
            if (!env.code) html = html.replace(/<pre>/g, '<span class="unsupported-warning" title="Code blocks not supported in ' + envName + '">⚠️</span><pre>');
            
            preview.innerHTML = html;
        } catch (e) {
            console.error('Markdown parsing error:', e);
            preview.innerHTML = '<p>Error rendering preview</p>';
        }
    }

    // Toolbar actions
    boldBtn.addEventListener('click', () => {
        const syntax = syntaxMap[currentEnv].bold;
        if (syntax) insertText(syntax.start, syntax.end);
    });
    italicBtn.addEventListener('click', () => {
        const syntax = syntaxMap[currentEnv].italic;
        if (syntax) insertText(syntax.start, syntax.end);
    });

    // Initialize preview
    updatePreview();
    
    // Listen for input events to update preview
    editor.addEventListener('input', () => {
        updatePreview();
    });
    
    // Add event listener for refresh button
    if (refreshPreviewBtn) {
        refreshPreviewBtn.addEventListener('click', () => {
            updatePreview();
        });
    }
    h1Btn.addEventListener('click', () => {
        if (syntaxMap[currentEnv].headings) insertText('\n# ', '');
    });
    h2Btn.addEventListener('click', () => {
        if (syntaxMap[currentEnv].headings) insertText('\n## ', '');
    });
    h3Btn.addEventListener('click', () => {
        if (syntaxMap[currentEnv].headings) insertText('\n### ', '');
    });
    linkBtn.addEventListener('click', () => {
        if (syntaxMap[currentEnv].links) insertText('[', '](https://)');
    });

    // Table dropdown
    tableDropdown.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            const cols = parseInt(e.target.dataset.cols, 10);
            createTable(cols);
        }
    });

    addRowBtn.addEventListener('click', addRow);
    deleteRowBtn.addEventListener('click', deleteRow);
    
    themeToggle.addEventListener('click', toggleTheme);

    // File operations
    saveBtn.addEventListener('click', () => {
        const textToSave = editor.value;
        const blob = new Blob([textToSave], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'note.md';
        a.click();
    });

    loadBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md, .txt';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                editor.value = e.target.result;
                updatePreview();
            };
            reader.readAsText(file);
        };
        input.click();
    });

    clearBtn.addEventListener('click', () => {
        editor.value = '';
        updatePreview();
    });

    // Generate environment-specific cheat sheet
    function generateCheatSheet() {
        let html = '<div class="cheat-sheet-environments">';
        
        // Create environment tabs
        html += '<div class="env-tabs">';
        for (const [key, name] of Object.entries(envDisplayNames)) {
            html += `<button class="env-tab" data-env="${key}">${name}</button>`;
        }
        html += '</div>';
        
        // Create content for each environment
        for (const [envName, env] of Object.entries(syntaxMap)) {
            let envHtml = '';
            const name = envDisplayNames[envName];
            
            envHtml += `<h3>${name} Markdown</h3>`;
            
            // Line breaks instruction
            if (envName !== 'whatsapp') {
                envHtml += '<h4>Line Breaks</h4><pre>First line with two spaces at the end  \nSecond line\n\nOR\n\nFirst line with backslash at the end\\\nSecond line</pre>';
            } else {
                envHtml += '<h4>Line Breaks</h4><p>WhatsApp does not support MD line breaks, but for this editor, you can make them appear by finishing a line with 2 spaces or the \\ character.</p>';
            }
            
            if (env.headings) {
                envHtml += '<h4>Headers</h4><pre># H1\n## H2\n### H3</pre>';
            }

            if (env.bold) {
                envHtml += `<h4>Bold</h4><pre>${env.bold.start}text${env.bold.end}</pre>`;
            }

            if (env.italic) {
                envHtml += `<h4>Italic</h4><pre>${env.italic.start}text${env.italic.end}</pre>`;
            }

            if (env.strikethrough) {
                envHtml += `<h4>Strikethrough</h4><pre>${env.strikethrough.start}text${env.strikethrough.end}</pre>`;
            }

            if (env.links) {
                envHtml += '<h4>Links</h4><pre>[text](https://example.com)</pre>';
            }

            if (env.code) {
                envHtml += '<h4>Code</h4><pre>`inline code`</pre>';
            }

            if (env.blockCode) {
                envHtml += `<h4>Code Block</h4><pre>${env.blockCode.start}language\ncode\n${env.blockCode.end}</pre>`;
            }

            if (env.tables) {
                envHtml += '<h4>Tables</h4><pre>| Header | Description |\n| ------ | ----------- |\n| Cell   | Content     |</pre>';
            }
            
            if (env.taskLists) {
                envHtml += '<h4>Task Lists</h4><pre>- [x] Completed task\n- [ ] Pending task</pre>';
            }
            
            if (env.mentions) {
                envHtml += '<h4>Mentions</h4><pre>@username</pre>';
            }
            
            if (env.spoiler) {
                envHtml += '<h4>Spoiler</h4><pre>||text||</pre>';
            }
            
            if (env.superscript) {
                envHtml += '<h4>Superscript</h4><pre>text^(superscript)</pre>';
            }
            
            html += `<div class="env-content" data-env="${envName}">${envHtml}</div>`;
        }
        
        html += '</div>';
        return html;
    }

    // Cheat sheet modal
    cheatSheetBtn.addEventListener('click', () => {
        const cheatSheetContent = document.getElementById('cheatSheetContent');
        if (cheatSheetContent) {
            cheatSheetContent.innerHTML = generateCheatSheet();
            
            // Set active tab to current environment
            setTimeout(() => {
                const tabs = document.querySelectorAll('.env-tab');
                const contents = document.querySelectorAll('.env-content');
                
                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        const env = tab.dataset.env;
                        tabs.forEach(t => t.classList.remove('active'));
                        contents.forEach(c => c.style.display = 'none');
                        
                        tab.classList.add('active');
                        document.querySelector(`.env-content[data-env="${env}"]`).style.display = 'block';
                    });
                });
                
                // Activate current environment
                const currentTab = document.querySelector(`.env-tab[data-env="${currentEnv}"]`);
                const currentContent = document.querySelector(`.env-content[data-env="${currentEnv}"]`);
                
                if (currentTab && currentContent) {
                    tabs.forEach(t => t.classList.remove('active'));
                    contents.forEach(c => c.style.display = 'none');
                    
                    currentTab.classList.add('active');
                    currentContent.style.display = 'block';
                }
            }, 0);
        }
        cheatSheetModal.style.display = 'block';
    });

    closeCheatSheet.addEventListener('click', () => {
        cheatSheetModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === cheatSheetModal) {
            cheatSheetModal.style.display = 'none';
        }
    });

    // Copy buttons
    copyMarkdownBtn.addEventListener('click', () => copyToClipboard(editor.value));
    copyTextBtn.addEventListener('click', () => copyToClipboard(preview.innerText));
    copyRtfBtn.addEventListener('click', () => {
        alert('To copy rich text, please right-click on the preview content and select "Copy" or "Copy (with formatting)" from the context menu.');
    });
    copyHtmlBtn.addEventListener('click', () => copyToClipboard(preview.innerHTML));
    
    // PDF Export button
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportToPdf);
    }
    
    // PDF Export function
    function exportToPdf() {
        if (!preview) return;
        
        showExportProgress();
        
        html2canvas(preview, {
            scale: 2, // Higher quality
            useCORS: true,
            logging: false
        }).then(canvas => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            let position = 0;
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            while (position < pdfHeight) {
                if (position > 0) {
                    pdf.addPage();
                }
                const heightLeft = pdfHeight - position;
                pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, pdfHeight);
                position += pageHeight;
            }
            
            // Generate filename with timestamp
            const now = new Date();
            const timestamp = [
                now.getFullYear(),
                String(now.getMonth() + 1).padStart(2, '0'),
                String(now.getDate()).padStart(2, '0'),
                String(now.getHours()).padStart(2, '0'),
                String(now.getMinutes()).padStart(2, '0'),
                String(now.getSeconds()).padStart(2, '0')
            ].join('');
            
            pdf.save(`markdown-${timestamp}.pdf`);
            hideExportProgress();
        }).catch(error => {
            console.error('PDF export failed:', error);
            hideExportProgress();
            alert('PDF export failed. Please try again.');
        });
    }
    
    // Show export progress indicator
    function showExportProgress() {
        let progress = document.getElementById('pdf-progress');
        if (!progress) {
            progress = document.createElement('div');
            progress.id = 'pdf-progress';
            progress.textContent = 'Exporting PDF...';
            progress.style.position = 'fixed';
            progress.style.top = '20px';
            progress.style.right = '20px';
            progress.style.padding = '10px 20px';
            progress.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            progress.style.color = 'white';
            progress.style.borderRadius = '5px';
            progress.style.zIndex = '10000';
            document.body.appendChild(progress);
        }
        progress.style.display = 'block';
    }
    
    // Hide export progress indicator
    function hideExportProgress() {
        const progress = document.getElementById('pdf-progress');
        if (progress) {
            progress.style.display = 'none';
        }
    }
    
    function insertText(start, end) {
        const startPos = editor.selectionStart;
        const endPos = editor.selectionEnd;
        const selectedText = editor.value.substring(startPos, endPos);
        const newText = start + selectedText + end;
        
        // Save current state for undo
        saveState();
        
        // Update editor content
        editor.value = editor.value.substring(0, startPos) + newText + editor.value.substring(endPos);
        
        // Set cursor position
        editor.focus();
        editor.selectionStart = startPos + start.length;
        editor.selectionEnd = startPos + start.length + selectedText.length;
        
        // Force preview update
        updatePreview();
    }

    function createTable(cols) {
        let table = '\n|';
        for (let i = 0; i < cols; i++) {
            table += ' Header |';
        }
        table += '\n|';
        for (let i = 0; i < cols; i++) {
            table += ' ------ |';
        }
        for (let r = 0; r < 3; r++) {
            table += '\n|';
            for (let i = 0; i < cols; i++) {
                table += '        |';
            }
        }
        insertText(table, '');
    }

    function addRow() {
        const text = editor.value;
        const tableRegex = /\n(\|.*\|\n)+\|/g;
        const match = text.match(tableRegex);
        if (match) {
            const lastTable = match[match.length - 1];
            const lines = lastTable.trim().split('\n');
            const lastRow = lines[lines.length - 1];
            const cols = (lastRow.match(/\|/g) || []).length -1;
            let newRow = '\n|';
            for (let i = 0; i < cols; i++) {
                newRow += '        |';
            }
            editor.value = text.replace(lastTable, lastTable + newRow);
            updatePreview();
        }
    }

    function deleteRow() {
        const text = editor.value;
        const tableRegex = /\n(\|.*\|\n)+\|/g;
        const match = text.match(tableRegex);
        if (match) {
            const lastTable = match[match.length - 1];
            const lines = lastTable.trim().split('\n');
            if (lines.length > 2) { // Keep header and separator
                lines.pop();
                const newTable = lines.join('\n');
                editor.value = text.replace(lastTable, newTable);
                updatePreview();
            }
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    }

    function toggleTheme() {
        const body = document.body;
        body.classList.toggle('dark-theme');
        // Update button text
        if (body.classList.contains('dark-theme')) {
            themeToggle.textContent = '🌙';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.textContent = '☀️';
            localStorage.setItem('theme', 'light');
        }
    }
    
    // Initial load
    // Theme initialization
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '🌙';
    }

});
