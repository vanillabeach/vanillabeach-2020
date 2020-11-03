import * as PubSub from 'pubsub-js';

import { LitElement, css, html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { JournalSummary } from '../../model/journalSummary';
import { State } from '../vb-app/index';
import { Signal } from '../vb-app/enums';

export class JournalNavigation extends LitElement {
  selectedJournal: string;
  hasLoaded: boolean;
  private journalList: string;

  static get properties() {
    return {
      hasLoaded: { type: Boolean },
      journalList: { type: String },
      selectedJournal: { type: String },
    };
  }
  static get styles() {
    return css`
      :host .site {
        max-width: 750px;
        margin: auto;
      }
    `;
  }

  private bindEvents() {
    const journalNavigation = this.shadowRoot.querySelector(
      '.journal-navigation'
    ) as HTMLElement;

    journalNavigation.addEventListener('change', this.changeJournal);
  }

  private bindPubSubEvents() {
    PubSub.subscribe(Signal.AppSync, (_: string, state: State) => {
      this.journalList = this.renderJournalList(state.pages.journal.navigation);
    });
  }

  private changeJournal(el: Event) {
    el.stopPropagation();
    el.preventDefault();

    const value = (el.target as HTMLSelectElement).value; 
    PubSub.publish(Signal.JournalEntryRequest, value);
  }

  private unbindEvents() {
    console.log('unbind events');

    const journalNavigation = this.shadowRoot.querySelector(
      '#journal-navigation'
    );
    journalNavigation.removeEventListener('change', this.changeJournal);
  }

  private unbindPubSubEvents() {
    PubSub.unsubscribe(Signal.AppSync);
  }

  private getJournals() {
    PubSub.publish(Signal.JournalNavigationRequest);
  }

  private renderJournalList(journalList: JournalSummary[]): string {
    if (!journalList) {
      return ``;
    }

    const html = journalList
      .map((x: JournalSummary) => `<option value='${x.id}'>${x.title}</option>`)
      .join('');
    return `${html}`;
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

  async firstUpdated() {
    this.bindEvents();
  }

  updated() {}

  render() {
    return html`
      <select class="journal-navigation">
        ${unsafeHTML(this.journalList)}
      </select>
    `;
  }
}
customElements.define('vb-journal-navigation', JournalNavigation);
