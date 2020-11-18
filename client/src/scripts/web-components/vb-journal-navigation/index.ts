import * as PubSub from 'pubsub-js';

import { LitElement, css, html } from 'lit-element';
import { JournalSummary } from '../../model/journalSummary';
import { State } from '../vb-app/index';
import { Signal } from '../vb-app/enums';

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
      :host .site {
        max-width: 750px;
        margin: auto;
      }

      :host a {
        color: #ffff00;
        text-decoration: none;
      }

      :host .cell-container {
        display: flex;
        flex-direction: horizontal;
      }

      :host .cell {
        flex: 1;
      }

      :host .cell.first {
        text-align: left;
      }

      :host .cell.second {
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
      if (!state.pages.journal.navigation) {
        return;
      }
      this.id = state.pages.journal.entry.id;
      this.journalList = [...state.pages.journal.navigation].reverse();
      this.getNavigationLinks();
    });
  }

  private changeJournal(el: Event) {
    el.stopPropagation();
    el.preventDefault();

    const target = el.target as HTMLElement;
    const journalId = target.getAttribute('data-value');

    PubSub.publish(Signal.JournalEntryRequest, journalId);
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
    const previousJournal = html`<a
      href="#"
      data-id="previous-journal"
      data-value="${this.previousJournalId}"
    >
      ${this.previousJournalTitle ? `« ${this.previousJournalTitle}` : ''}
    </a>`;

    const nextJournal = html`<a
      href="#"
      data-id="next-journal"
      data-value="${this.nextJournalId}"
    >
      ${this.nextJournalTitle ? `${this.nextJournalTitle} »` : ''}
    </a>`;

    return html`
      <div class="cell-container">
        <div class="cell first">
          ${previousJournal}
        </div>
        <div class="cell second">
          ${nextJournal}
        </div>
      </div>
    `;
  }
}
customElements.define('vb-journal-navigation', JournalNavigation);
