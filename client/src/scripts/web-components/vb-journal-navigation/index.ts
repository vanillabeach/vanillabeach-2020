import * as PubSub from 'pubsub-js';
import { LitElement, css, html } from 'lit-element';
import { Config } from '../../config';
import { JournalSummary } from '../../model/journalSummary';
import { Navigation } from '../vb-app/navigation';
import { State } from '../vb-app/index';
import { Signal } from '../vb-app/enums';

const fadeDuration = Config.style.fadeDuration;

export class JournalNavigation extends LitElement {
  id: string;
  private journalList: JournalSummary[];
  private previousJournalId: string;
  private previousJournalTitle: string;
  private nextJournalId: string;
  private nextJournalTitle: string;

  static get properties() {
    return {
      id: { type: String },
      journalList: { type: String },
    };
  }
  static get styles() {
    return css`
      :host {
        max-width: 750px;
        margin: auto;
      }

      :host a {
        display: inline-block;
        margin-right: 10px;
        margin-bottom: 20px;
        padding-left: 15px;
        padding-right: 15px;
        padding-top: 5px;
        padding-bottom: 5px;
        border: 1px solid var(--foreground-color);
        border-bottom: solid var(--foreground-color);
        color: var(--foreground-color);
        text-align: right;
        cursor: pointer;
        outline: none;
        text-decoration: none;
      }

      :host .journal-navigation {
        transition: opacity ${fadeDuration}ms ease-in;
        display: flex;
        flex-direction: horizontal;
        opacity: 0;
      }

      :host .journal-navigation.show {
        opacity: 1;
      }

      :host .cell {
        flex: 1;
      }

      :host .cell.first {
        margin-left: 20px;
        text-align: left;
      }

      :host .cell.second {
        margin-right: 10px;
        text-align: right;
      }
    `;
  }

  private bindEvents() {
    const previousJournal: HTMLElement = this.shadowRoot.querySelector(
      '*[data-id="previous-journal"]'
    );
    const nextJournal: HTMLElement = this.shadowRoot.querySelector(
      '*[data-id="next-journal"]'
    );

    if (previousJournal) {
      previousJournal.addEventListener('click', this.changeJournal);
    }

    if (nextJournal) {
      nextJournal.addEventListener('click', this.changeJournal);
    }
  }

  private bindPubSubEvents() {
    PubSub.subscribe(Signal.AppSync, (_: string, state: State) => {
      if (!state.pages.journal.navigation || !state.pages.journal.entry) {
        return;
      }
      this.id = state.pages.journal.entry.id;
      this.journalList = [...state.pages.journal.navigation].reverse();
      this.getNavigationLinks();
      this.fadeIn();
    });
  }

  private changeJournal(el: Event) {
    el.stopPropagation();
    el.preventDefault();

    const target = el.target as HTMLElement;
    const journalId = target.getAttribute('data-value');
    Navigation.navigateTo(Config.navigation.journal.pageId, journalId);
  }

  private fadeIn() {
    const navigationEl: HTMLElement = this.shadowRoot.querySelector('#journal-navigation');
    navigationEl.classList.add('show');
  }

  private unbindEvents() {
    const previousJournal: HTMLElement = this.shadowRoot.querySelector(
      '*[data-id="previous-journal"]'
    );
    const nextJournal: HTMLElement = this.shadowRoot.querySelector(
      '*[data-id="previous-journal"]'
    );

    previousJournal.removeEventListener('click', this.changeJournal);
    nextJournal.removeEventListener('click', this.changeJournal);
  }

  private unbindPubSubEvents() {
    PubSub.unsubscribe(Signal.AppSync);
  }

  private getJournals() {
    PubSub.publish(Signal.JournalNavigationRequest);
  }

  private getNavigationLinks() {
    this.journalList.forEach((entry: JournalSummary, index: number) => {
      if (entry.id == this.id) {
        if (index > 0) {
          this.previousJournalId = this.journalList[index - 1].id;
          this.previousJournalTitle = this.journalList[index - 1].title;
        }
        if (index < this.journalList.length - 1) {
          this.nextJournalId = this.journalList[index + 1].id;
          this.nextJournalTitle = this.journalList[index + 1].title;
        }
        return;
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unbindEvents();
    this.unbindPubSubEvents();
  }

  connectedCallback() {
    super.connectedCallback();
    this.bindPubSubEvents();
    this.getJournals();
  }

  updated() {
    this.bindEvents();
  }

  render() {
    const previousJournal = this.previousJournalId ? html`<a
      href="#"
      data-id="previous-journal"
      data-value="${this.previousJournalId}"
    >
      ${this.previousJournalTitle ? `« ${this.previousJournalTitle}` : ''}
    </a>` : html``;

    const nextJournal = this.nextJournalId ? html`<a
      href="#"
      data-id="next-journal"
      data-value="${this.nextJournalId}"
    >
      ${this.nextJournalTitle ? `${this.nextJournalTitle} »` : ''}
    </a>` : html``;

    return html`
      <div id="journal-navigation" class="journal-navigation">
        <div class="cell first">${previousJournal}</div>
        <div class="cell second">${nextJournal}</div>
      </div>
    `;
  }
}
customElements.define('vb-journal-navigation', JournalNavigation);
