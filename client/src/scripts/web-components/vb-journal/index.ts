import * as PubSub from 'pubsub-js';
import { LitElement, css, html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { Journal } from '../../model/journal';
import { Utils } from '../../utils';
import { State } from '../vb-app/index';
import { Signal } from '../vb-app/enums';
import { Config } from '../../config';

const renderEffects = false;
const fadeDuration = 200;

class JournalWebComponent extends LitElement {
  private content: string;
  private journal: Journal;
  private atomicClass: string;
  private scrollEvent = () => this.animateLettering();

  static get properties() {
    return {
      atomicClass: { type: String },
      content: { type: String },
    };
  }

  constructor() {
    super();
    this.atomicClass = 'atomic';
    this.content = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.bindWindowEvents();
    this.bindPubSubEvents();
    this.getJournalEntry();
  }

  disconnectedCallback() {
    this.unbindWindowEvents();
    this.unbindPubSubEvents();
  }

  attributeChangedCallback(
    name: string,
    oldval: string | null,
    newval: string | null
  ) {
    super.attributeChangedCallback(name, oldval, newval);
  }

  static get styles() {
    const journalOpacity = renderEffects ? css`var(--journalOpacity)` : css`1`;
    const opacityTransition = css`${fadeDuration}ms`;

    return css`
      :host {
        line-height: 1.5;
        font-size: var(--body);
        color: var(--body-text-color);
        text-shadow: 0px 1px var(--foreground);
      }

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

      :host #journal {
        transition: opacity ${opacityTransition} ease-in;
        opacity: 0;
      }

      :host #journal.show {
        opacity: 1;
      }

      :host .journal-entry {
        opacity: ${journalOpacity};
      }

      :host .journal-entry span {
        background-color: transparent !important;
        font-size: var(--body) !important;
      }

      :host .journal-entry > img {
        width: 100%;
      }

      :host .journal-entry > div > img {
        max-width: 50%;
      }

      :host a {
        color: var(--link-colour);
        font-size: var(--body) !important;
        text-decoration: none;
      }
    `;
  }

  render() {
    if (!this.journal) {
      return html`<section id="journal"></section>`;
    }

    return html`
      <section id="journal">
        <div class="frame">
          <h2>${this.journal.title}</h2>
          <article class="journal-entry">
            <img id="journal-header-image" />
            ${unsafeHTML(this.content)}
          </article>
        </div>
      </section>
    `;
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

  private bindPubSubEvents() {
    PubSub.subscribe(Signal.AppSync, (_: string, state: State) => {
      if (!state.pages.journal.entry) {
        return;
      }
      this.fadeOut(() => {
        this.journal = state.pages.journal.entry;
        this.setAttribute('content', this.journal.entry);
        this.init();
      });

      // if (renderEffects) {
      //   window.setTimeout(() => this.animateLettering(), 1000);
      // }
    });
  }

  private unbindPubSubEvents() {
    PubSub.unsubscribe(Signal.AppSync);
  }

  private bindWindowEvents() {
    if (renderEffects) {
      window.addEventListener('scroll', Utils.debounce(this.scrollEvent, 100));
    }
  }

  private init() {
    const journalHeaderImageEl:HTMLImageElement = this.shadowRoot.querySelector(
      '#journal-header-image'
    );
    journalHeaderImageEl.onload = () => this.fadeIn();
    journalHeaderImageEl.src = this.journalImagePath;
  }

  private fadeIn() {
    window.scrollTo(0,0);
    const journalEl:HTMLElement = this.shadowRoot.querySelector('#journal');
    journalEl.classList.add('show');

  }

  private fadeOut(callback?: Function) {
    const journalEl:HTMLElement = this.shadowRoot.querySelector('#journal');
    journalEl.classList.remove('show');
    if (callback) {
      setTimeout(callback.bind(this), fadeDuration);
    }
  }

  private unbindWindowEvents() {
    window.removeEventListener('scroll', this.scrollEvent);
  }

  // private convertText(e: HTMLElement) {
  //   if (e.hasChildNodes()) {
  //     e.childNodes.forEach((child) => this.convertText(child as HTMLElement));
  //     return;
  //   }

  //   const text = e.cloneNode().textContent;
  //   const newNode = document.createElement('span');
  //   newNode.innerHTML = this.textToSpan(text);
  //   e.parentNode.insertBefore(newNode, e.nextSibling);
  //   e.parentNode.removeChild(e);
  // }

  // private get renderedText(): string {
  //   const el = document.createElement('article');

  //   el.innerHTML = this.content;
  //   el.normalize();
  //   this.convertText(el);
  //   return el.innerHTML;
  // }
  // private textToSpan(el: string): string {
  //   const contentArray = el.split(' ');
  //   const initialOpacity = renderEffects ? 0 : 1;
  //   let accumulator = 0;

  //   return contentArray
  //     .map((x: string, index: number) => {
  //       const latency = accumulator;
  //       const speed = Math.random();
  //       const style = `transition: ${speed}s ${latency}s ease-in; opacity: ${initialOpacity};`;

  //       accumulator += Math.random() / 100;
  //       return `<span data-id='atom' part='${this.atomicClass}' style='${style}'>${x} </span>`;
  //     })
  //     .join('');
  // }

  private getJournalEntry() {
    PubSub.publish(Signal.JournalEntryRequest);
  }

  private get journalImagePath(): string {
    return `${Config.url.server.journal.media}/${this.journal.picUrl}`;
  }
}

customElements.define('vb-journal', JournalWebComponent);
