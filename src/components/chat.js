import { askGemini } from '../services/gemini.js';
import { sound } from '../services/sound.js';
import { i18n } from '../services/i18n.js';

export class ChatComponent {
  constructor(container) {
    this.container = container;
    this.messages = [
      {
        id: 'm1',
        sender: 'model',
        text: `### ${i18n.t('chatWelcomeTitle')}\n${i18n.t('chatWelcomeText')}`,
        source: 'system'
      }
    ];
    this.isTyping = false;
  }

  render() {
    this.container.innerHTML = `
      <div class="w-full space-y-4 animate-fade-in">
        <!-- Desktop Dual Pane Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT SIDEBAR: Quick Prompts on Desktop -->
          <div class="lg:col-span-4 space-y-4">
            <div class="glass-card p-5 rounded-3xl border space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span>⚡ Quick Safety Prompts</span>
                </h3>
                <span class="text-[10px] bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded-full font-bold">1-Tap</span>
              </div>
              
              <div class="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-1 lg:pb-0">
                <button data-prompt="${i18n.t('promptFollowed')}" class="quick-chip whitespace-nowrap lg:whitespace-normal text-left px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border transition active:scale-95">
                  ${i18n.t('chipFollowed')}
                </button>
                <button data-prompt="${i18n.t('promptDeescalate')}" class="quick-chip whitespace-nowrap lg:whitespace-normal text-left px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border transition active:scale-95">
                  ${i18n.t('chipDeescalate')}
                </button>
                <button data-prompt="${i18n.t('promptBleeding')}" class="quick-chip whitespace-nowrap lg:whitespace-normal text-left px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border transition active:scale-95">
                  ${i18n.t('chipBleeding')}
                </button>
                <button data-prompt="${i18n.t('promptCpr')}" class="quick-chip whitespace-nowrap lg:whitespace-normal text-left px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border transition active:scale-95">
                  ${i18n.t('chipCpr')}
                </button>
                <button data-prompt="${i18n.t('promptRideshare')}" class="quick-chip whitespace-nowrap lg:whitespace-normal text-left px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 border transition active:scale-95">
                  ${i18n.t('chipRideshare')}
                </button>
              </div>
            </div>

            <!-- Model Info Card -->
            <div class="hidden lg:block glass-card p-5 rounded-3xl border space-y-2 text-xs">
              <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🤖 Gemini 2.0 Flash Guard</span>
              </div>
              <p class="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Trained on emergency first aid, physical de-escalation protocols, and threat evasion. Works offline with built-in safety rules.
              </p>
            </div>
          </div>

          <!-- RIGHT MAIN CHAT WINDOW -->
          <div class="lg:col-span-8 glass-card p-4 md:p-6 rounded-3xl border flex flex-col h-[520px] md:h-[580px]">
            <!-- Messages Stream -->
            <div id="chat-messages-container" class="flex-1 overflow-y-auto space-y-3 pr-2 py-1">
              ${this.messages.map(msg => this._renderMessage(msg)).join('')}
              ${this.isTyping ? `
                <div class="flex items-center space-x-2 p-3.5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl rounded-tl-none border max-w-[80%] animate-pulse">
                  <div class="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-bounce"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.4s]"></div>
                  <span class="text-xs text-slate-600 dark:text-slate-400 font-medium ml-1.5">${i18n.t('analyzingSafety')}</span>
                </div>
              ` : ''}
            </div>

            <!-- Input Bar -->
            <form id="chat-form" class="mt-3 relative flex items-center shrink-0">
              <input 
                type="text" 
                id="chat-input" 
                placeholder="${i18n.t('chatPlaceholder')}" 
                class="w-full pl-5 pr-14 py-3.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
                autocomplete="off"
              />
              <button 
                type="submit" 
                class="absolute right-2 p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition active:scale-95 flex items-center justify-center shadow-md"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
    this._scrollToBottom();
  }

  _renderMessage(msg) {
    const isUser = msg.sender === 'user';
    const formattedHtml = this._formatMarkdown(msg.text);

    return `
      <div class="flex flex-col ${isUser ? 'items-end' : 'items-start'}">
        <div class="max-w-[90%] md:max-w-[85%] p-4 md:p-5 rounded-2xl ${
          isUser 
            ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-br-none shadow-md' 
            : 'bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none space-y-2 shadow-sm'
        }">
          <div class="text-xs md:text-sm leading-relaxed prose-invert prose-p:my-1 prose-ul:my-1">
            ${formattedHtml}
          </div>

          ${!isUser ? `
            <div class="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[10px] md:text-xs text-slate-500 dark:text-slate-400">
              <span class="flex items-center space-x-1.5">
                <span class="w-2 h-2 rounded-full ${msg.source === 'gemini-2.0-flash' ? 'bg-cyan-500' : 'bg-amber-500'}"></span>
                <span class="font-medium">${msg.source === 'gemini-2.0-flash' ? i18n.t('sourceGemini') : i18n.t('sourceOffline')}</span>
              </span>

              <div class="flex items-center space-x-3 font-semibold">
                <button data-speak-text="${encodeURIComponent(msg.text)}" class="speak-btn hover:text-cyan-600 dark:hover:text-cyan-300 transition flex items-center space-x-1">
                  <span>${i18n.t('speakBtn')}</span>
                </button>
                <button data-copy-text="${encodeURIComponent(msg.text)}" class="copy-chat-btn hover:text-cyan-600 dark:hover:text-cyan-300 transition flex items-center space-x-1">
                  <span>${i18n.t('copyBtn')}</span>
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _formatMarkdown(text) {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-sm md:text-base font-bold text-cyan-600 dark:text-cyan-300 my-1.5">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-700 dark:text-slate-300">$1</em>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  }

  _bindEvents() {
    const form = this.container.querySelector('#chat-form');
    const input = this.container.querySelector('#chat-input');

    if (form && input) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text || this.isTyping) return;

        input.value = '';
        await this.sendMessage(text);
      });
    }

    this.container.querySelectorAll('.quick-chip').forEach(btn => {
      btn.addEventListener('click', async () => {
        const prompt = btn.getAttribute('data-prompt');
        if (prompt && !this.isTyping) {
          await this.sendMessage(prompt);
        }
      });
    });

    this.container.querySelectorAll('.speak-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = decodeURIComponent(btn.getAttribute('data-speak-text'));
        const cleanText = text.replace(/[*#]/g, '');
        sound.speak(cleanText);
      });
    });

    this.container.querySelectorAll('.copy-chat-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const text = decodeURIComponent(btn.getAttribute('data-copy-text'));
        await navigator.clipboard.writeText(text);
        btn.innerText = '✓ ' + i18n.t('copied');
        setTimeout(() => { btn.innerText = i18n.t('copyBtn'); }, 2000);
      });
    });
  }

  async sendMessage(text) {
    this.messages.push({
      id: `u-${Date.now()}`,
      sender: 'user',
      text
    });

    this.isTyping = true;
    this.render();

    try {
      const reply = await askGemini(text, this.messages);
      this.messages.push({
        id: `m-${Date.now()}`,
        sender: 'model',
        text: reply.text,
        source: reply.source
      });
    } catch (e) {
      this.messages.push({
        id: `m-${Date.now()}`,
        sender: 'model',
        text: i18n.lang === 'hi' ? 'क्षमा करें, आपातकालीन सहायता के लिए कृपया 112 पर तुरंत कॉल करें।' : 'Sorry, please call 112 / 911 for immediate emergency help.',
        source: 'system'
      });
    } finally {
      this.isTyping = false;
      this.render();
    }
  }

  _scrollToBottom() {
    const box = this.container.querySelector('#chat-messages-container');
    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  }
}