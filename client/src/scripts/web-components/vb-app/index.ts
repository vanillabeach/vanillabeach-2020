import { LitElement, PropertyValues, css, html } from 'lit-element';
import * as PubSub from 'pubsub-js';
import { AppFileHandler } from './handlers';
import { Journal } from '../../model/journal';
import { JournalSummary } from '../../model/journalSummary';
import { Signal } from './enums';

export type State = {
  pages: {
    journal: {
      entry: Journal;
      navigation: JournalSummary[];
    };
  };
};

export class App extends LitElement {
  message: string;
  state: State;

  static get properties() {
    return {
      message: {
        type: String,
      },
      state: {
        attribute: false,
      },
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

  private bindPubSubEvents() {
    PubSub.subscribe(
      Signal.JournalEntryRequest,
      async (_: string, id?: string) => {
        const journalEntry = await AppFileHandler.journalEntry(id);

        this.state.pages.journal.entry = journalEntry;
        this.state = { ...this.state };
        this.broadcastState();
      }
    );

    PubSub.subscribe(Signal.JournalNavigationRequest, async () => {
      const journalList = await AppFileHandler.journalList();

      this.state.pages.journal.navigation = journalList;
      this.state = { ...this.state };
      this.broadcastState();
    });
  }

  private broadcastState() {
    PubSub.publish(Signal.AppSync, this.state);
  }

  private getInitialState(): State {
    return {
      pages: {
        journal: {
          navigation: null,
          entry: null,
        },
      },
    };
  }

  constructor() {
    super();
    this.message = 'No message';
    this.state = this.getInitialState();
    this.bindPubSubEvents();
  }

  updated(changedProperties: PropertyValues) {
    console.log('state', this.state);
  }

  connectedCallback() {
    super.connectedCallback();
  }

  render() {
    return html`
      <vb-background class="background"></vb-background>
      <section class="site">
        <slot></slot>
      </section>
    `;
  }
}
customElements.define('vb-app', App);
