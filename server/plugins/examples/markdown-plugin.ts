import { MessageTransformerPlugin } from '../base-plugin';
import { PluginMetadata, PluginConfig } from '../types';

export class MarkdownPlugin extends MessageTransformerPlugin {
    constructor() {
        const metadata: PluginMetadata = {
            id: 'markdown-plugin',
            name: 'Markdown Plugin',
            version: '1.0.0',
            description: 'Transforms markdown content to HTML',
            author: 'EchoChamber'
        };

        const config: PluginConfig = {
            apiKey: 'your-api-key-here',
            eventSubscriptions: ['message.created', 'message.updated'],
            customConfig: {
                allowHtml: false,
                enableExtensions: true
            }
        };

        super(metadata, config);
    }

    async transformIncoming(message: any): Promise<any> {
        if (typeof message.content !== 'string') {
            return message;
        }

        // Basic markdown transformation
        const transformed = message.content
            // Headers
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Code blocks
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            // Inline code
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            // Lists
            .replace(/^\s*-\s(.*)/gm, '<li>$1</li>')
            // Paragraphs
            .replace(/\n\n/g, '</p><p>');

        return {
            ...message,
            content: `<p>${transformed}</p>`,
            contentType: 'text/html'
        };
    }

    async transformOutgoing(message: any): Promise<any> {
        if (typeof message.content !== 'string' || message.contentType !== 'text/html') {
            return message;
        }

        // Convert HTML back to markdown if needed
        // This is a simplified example - in practice you might want to use a proper HTML-to-markdown converter
        const transformed = message.content
            .replace(/<h1>(.*?)<\/h1>/g, '# $1')
            .replace(/<h2>(.*?)<\/h2>/g, '## $1')
            .replace(/<h3>(.*?)<\/h3>/g, '### $1')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '*$1*')
            .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '```$1```')
            .replace(/<code>(.*?)<\/code>/g, '`$1`')
            .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
            .replace(/<li>(.*?)<\/li>/g, '- $1')
            .replace(/<\/?p>/g, '\n\n');

        return {
            ...message,
            content: transformed.trim(),
            contentType: 'text/markdown'
        };
    }

    async initialize(): Promise<void> {
        await super.initialize();
        console.log('Markdown Plugin: Initialized with config:', this.config.customConfig);
    }

    async terminate(): Promise<void> {
        await super.terminate();
        console.log('Markdown Plugin: Cleaned up resources');
    }
}
