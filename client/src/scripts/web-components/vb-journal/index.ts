import * as PubSub from 'pubsub-js';
import { LitElement, css, html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { DateTime } from 'luxon';
import { Config } from '../../config';
import { Journal } from '../../model/journal';
import { Signal } from '../vb-app/enums';
import { State } from '../vb-app/index';

const renderEffects = false;
const fadeDuration = Config.style.fadeDuration;

class JournalWebComponent extends LitElement {
  private content: string;
  private journal: Journal;

  static get properties() {
    return {
      content: { type: String },
    };
  }

  constructor() {
    super();
    this.content = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.bindPubSubEvents();
    this.getJournalEntry();
  }

  disconnectedCallback() {
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

    return css`
      :host {
        line-height: 1.5;
        font-family: var(--body-font-family);
        font-size: var(--body);
        color: var(--body-text-color);
        text-shadow: var(--body-text-shadow);
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
        transition: opacity ${fadeDuration}ms ease-in;
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

      :host .journal-content > img {
        width: 100%;
      }

      :host .journal-content > div > img {
        max-width: 50%;
      }

      :host .journal-content,
      :host .journal-title {
        display: block;
        padding: var(--section-padding);
      }

      :host .journal-header {
        -webkit-font-smoothing: antialiased;
        font-family: var(--header-font-family);
        text-align: center;
        text-transform: uppercase;
        padding-top: 20px;
      }

      :host .journal-header .journal-title {
        color: var(--content-foreground-color);
        font-weight: 100;
      }

      :host .journal-header h2,
      :host .journal-header h4 {
        line-height: 1;
        padding: 0;
        margin: 0;
      }

      :host .journal-header h4 {
        padding-top: 10px;
      }

      :host #journal-header-image {
        width: 100%;
        margin-top: 0;
        margin-bottom: 0;      
      }

      :host a {
        color: var(--link-color);
        font-size: var(--body) !important;
        display: inline-block;
        background-color: #00000011;
        text-decoration: none;
        padding-left: 0.2em;
        padding-right: 0.2em;
      }
    `;
  }

  render() {
    if (!this.journal) {
      return html`<section id="journal"></section>`;
    }

    const journalDateTime = DateTime.fromMillis(Number(this.journal.date));
    const date = journalDateTime.toFormat("hh:mm a · dd MMMM yyyy") ;
    
    return html`
      <section id="journal">
        <div class="frame">
          <header class="journal-header">
            <h2 class="journal-title">${this.journal.title}</h2>
            <h4>${date}</h4>
          </header>
          <article id="journal-entry" class="journal-entry">
            <img id="journal-header-image" />
            <div class="journal-content">
            ${unsafeHTML(this.content)}
            </div>
          </article>
        </div>
      </section>
    `;
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
    });
  }

  private unbindPubSubEvents() {
    PubSub.unsubscribe(Signal.AppSync);
  }


  private init() {
    setTimeout(() => {
      const journalHeaderImageEl: HTMLImageElement = this.shadowRoot.querySelector(
        '#journal-header-image'
      );
      const journalEntryEl: HTMLElement = this.shadowRoot.querySelector(
        '#journal-entry'
      );

      journalHeaderImageEl.onload = () => {
        const offset = journalHeaderImageEl.height;
        journalEntryEl.style.marginTop = `${offset}px`;
        journalHeaderImageEl.style.marginTop = `-${offset}px`;
        this.fadeIn();
      }
      journalHeaderImageEl.src = this.journalImagePath;
    }, 50);
  }

  private fadeIn() {
    window.scrollTo(0, 0);
    const journalEl: HTMLElement = this.shadowRoot.querySelector('#journal');
    journalEl.classList.add('show');
  }

  private fadeOut(callback?: Function) {
    const journalEl: HTMLElement = this.shadowRoot.querySelector('#journal');
    journalEl.classList.remove('show');
    if (callback) {
      setTimeout(callback.bind(this), fadeDuration);
    }
  }

  private getJournalEntry() {
    PubSub.publish(Signal.JournalEntryRequest);
  }

  private get journalImagePath(): string {
    return `${Config.url.server.journal.media}/${this.journal.picUrl}`;
  }
}

customElements.define('vb-journal', JournalWebComponent);
