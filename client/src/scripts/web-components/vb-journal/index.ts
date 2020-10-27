import { LitElement, css, html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { Config } from '../../config';
import { Journal } from '../../model/journal';
import { Marked } from '@ts-stack/markdown';
import { Utils } from '../../utils';
import * as PubSub from 'pubsub-js'

const renderEffects = false;

class JournalWebComponent extends LitElement {
  url: string;
  private content: string;
  private journal: Journal;
  private atomicClass: string;
  private scrollEvent = () => this.animateLettering();

  static get properties() {
    return {
      atomicClass: { type: String },
      content: { type: String },
      url: { type: String },
    };
  }

  private animateLettering() {
    const letters = this.shadowRoot.querySelectorAll('*[data-id="atom"]');
    const threshold = window.pageYOffset + window.innerHeight;

    letters.forEach((x: HTMLElement) => {
      if (x.getBoundingClientRect().top >= threshold) {
        return;
      }
      x.style.opacity = '1';
    });
  }

  private get renderedText(): string {
    const el = document.createElement('article');

    el.innerHTML = this.content;
    el.normalize();
    this.convertText(el);
    return el.innerHTML;
  }

  private convertText(e: HTMLElement) {
    if (e.hasChildNodes()) {
      e.childNodes.forEach((child) => this.convertText(child as HTMLElement));
      return;
    }

    const text = e.cloneNode().textContent;
    const newNode = document.createElement('span');
    newNode.innerHTML = this.textToSpan(text);
    e.parentNode.insertBefore(newNode, e.nextSibling);
    e.parentNode.removeChild(e);
  }

  private textToSpan(el: string): string {
    const contentArray = el.split(' ');
    const initialOpacity = renderEffects ? 0 : 1;
    let accumulator = 0;

    return contentArray
      .map((x: string, index: number) => {
        const latency = accumulator;
        const speed = Math.random();
        const style = `transition: ${speed}s ${latency}s ease-in; opacity: ${initialOpacity};`;

        accumulator += Math.random() / 100;
        return `<span data-id='atom' part='${this.atomicClass}' style='${style}'>${x} </span>`;
      })
      .join('');
  }

  private getJournalEntry() {
    fetch(this.url, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        this.journal = data as Journal;
        this.setAttribute('content', Marked.parse(this.journal.entry));
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  constructor() {
    super();
    this.atomicClass = 'atomic';
    this.url = Config.url.server.journal;
    this.content = '';
    PubSub.subscribe('MY TOPIC', (data:any) => {
      console.log('pubsub : ', data);
    });

  }

  connectedCallback() {
    super.connectedCallback();
    this.getJournalEntry();
    if (renderEffects) {
      window.setTimeout(() => this.animateLettering(), 1000);
      window.addEventListener('scroll', Utils.debounce(this.scrollEvent, 100));
    }
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.scrollEvent);
  }

  attributeChangedCallback(
    name: string,
    oldval: string | null,
    newval: string | null
  ) {
    console.log('attribute change: ', name, newval);
    super.attributeChangedCallback(name, oldval, newval);
  }

  static get styles() {
    const journalOpacity = renderEffects ? css`var(--journalOpacity)` : css`1`;

    return css`
      :host h1 {
        font-size: var(--h1);
      }
      :host h2 {
        font-size: var(--h2);
      }

      :host h3 {
        font-size: var(--h3);
      }

      :host h4 {
        font-size: var(--h4);
      }

      :host .journal-entry {
        opacity: ${journalOpacity};
      }
    `;
  }

  render() {
    return html`
      <section>
        <div class="frame">
          <h2>${this.journal.title}</h2>
          <article class="journal-entry">
            ${unsafeHTML(this.renderedText)}
          </article>
        </div>
      </section>
    `;
  }
}

customElements.define('vb-journal', JournalWebComponent);
