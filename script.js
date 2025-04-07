class NotionClone {
    constructor() {
        this.state = {
            pages: [],
            currentPage: null,
            editor: null
        };
        
        this.initEditor();
        this.loadPages();
        this.setupEventListeners();
    }

    initEditor() {
        this.state.editor = new tiptap.Editor({
            element: document.querySelector('#editor'),
            extensions: [
                tiptap.Document,
                tiptap.Paragraph,
                tiptap.Text,
                tiptap.Heading.configure({ levels: [1, 2, 3] }),
                tiptap.Bold,
                tiptap.Italic,
                tiptap.Blockquote,
                tiptap.CodeBlock,
                tiptap.BulletList,
                tiptap.OrderedList,
                tiptap.TaskList,
                tiptap.HorizontalRule,
            ],
            content: '<p>Comienza a escribir...</p>',
            onUpdate: () => this.saveContent(),
            onTransaction: () => this.handleSlashCommand()
        });
    }

    handleSlashCommand() {
        const { state } = this.state.editor;
        const { selection } = state;
        const currentNode = state.doc.nodeAt(selection.from);
        
        if (currentNode?.textContent === '/') {
            this.showSlashMenu(selection.from);
        }
    }

    showSlashMenu(pos) {
        const menu = document.createElement('div');
        menu.className = 'slash-menu p-2 absolute z-50';
        
        const commands = [
            { icon: '📝', label: 'Texto', command: 'paragraph' },
            { icon: '🔲', label: 'Encabezado 1', command: 'heading1' },
            { icon: '📋', label: 'Lista', command: 'bulletList' },
            { icon: '📌', label: 'Cita', command: 'blockquote' },
            { icon: '📊', label: 'Tabla', command: 'table' },
        ];
        
        commands.forEach(cmd => {
            const button = document.createElement('button');
            button.className = 'flex items-center space-x-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded';
            button.innerHTML = `
                <span>${cmd.icon}</span>
                <span class="dark:text-white">${cmd.label}</span>
            `;
            button.onclick = () => this.executeCommand(cmd.command, pos);
            menu.appendChild(button);
        });
        
        const coords = this.state.editor.view.coordsAtPos(pos);
        menu.style.top = `${coords.top + 20}px`;
        menu.style.left = `${coords.left}px`;
        document.body.appendChild(menu);
        
        setTimeout(() => {
            menu.remove();
        }, 5000);
    }

    executeCommand(command, pos) {
        const { state, view } = this.state.editor;
        const transaction = state.tr.delete(pos - 1, pos);
        
        switch(command) {
            case 'heading1':
                transaction.setBlockType(pos - 1, pos - 1, state.schema.nodes.heading, { level: 1 });
                break;
            case 'table':
                this.insertTable();
                break;
            // ... más comandos
        }
        
        view.dispatch(transaction);
    }

    insertTable() {
        const table = document.createElement('div');
        table.className = 'table-wrapper border-collapse w-full';
        table.innerHTML = `
            <div class="table-header flex bg-gray-100 dark:bg-gray-700">
                <div class="p-2 flex-1 border-r dark:border-gray-600">Columna 1</div>
                <div class="p-2 flex-1">Columna 2</div>
            </div>
            <div class="table-body">
                <div class="flex border-b dark:border-gray-700">
                    <div class="p-2 flex-1 border-r dark:border-gray-600">Celda 1</div>
                    <div class="p-2 flex-1">Celda 2</div>
                </div>
            </div>
        `;
        this.state.editor.view.dispatch(
            this.state.editor.state.tr.replaceSelectionWith(
                this.state.editor.state.schema.node('paragraph', null, [table])
            )
        );
    }

    loadPages() {
        // Cargar desde IndexedDB o API
        this.state.pages = JSON.parse(localStorage.getItem('notion-pages')) || [];
        this.renderNavigation();
    }

    saveContent() {
        const content = this.state.editor.getHTML();
        // Guardar en estado y persistir
        localStorage.setItem('notion-pages', JSON.stringify(this.state.pages));
    }

    renderNavigation() {
        const nav = document.querySelector('#navigation');
        nav.innerHTML = this.generateNavTree(this.state.pages);
    }

    generateNavTree(pages, level = 0) {
        return pages.map(page => `
            <div class="nav-item pl-${level * 4} py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                <div class="flex items-center justify-between">
                    <span class="dark:text-white">${page.title}</span>
                    <button class="toggle-subpages">▶</button>
                </div>
                ${page.children ? this.generateNavTree(page.children, level + 1) : ''}
            </div>
        `).join('');
    }
}

// Inicializar la aplicación
new NotionClone();