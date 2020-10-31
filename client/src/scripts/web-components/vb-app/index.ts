import { LitElement, PropertyValues, css, html } from 'lit-element';
import * as PubSub from 'pubsub-js';
import { AppFileHandler } from './handlers';
import { JournalSummary } from '../../model/journalSummary';

export type State = {
  journals: {
    list: JournalSummary[];
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
    PubSub.subscribe('JournalNavigationRequest', async () => {
      this.state.journals.list = await AppFileHandler.journalList();
      this.state = { ...this.state };

      PubSub.publish('AppSync', this.state);
    });
  }

  private getInitialState(): State {
    return {
      journals: {
        list: [],
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
      <!-- <vb-background class="background"></vb-background> -->
      <button id="test" />Test</button>
      <section class="site">
        <slot></slot>
      </section>
    `;
  }
}
customElements.define('vb-app', App);
