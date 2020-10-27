import { LitElement, PropertyValues, css, html } from 'lit-element';
import * as PubSub from 'pubsub-js'
import {AppFileHandler} from './handlers';

export class App extends LitElement {
  message: string;
  state: object;

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
      'JournalNavigationRequest', () => {
        PubSub.publish('JournalNavigationResponse', AppFileHandler.journalList());
      }
    );
  }

  constructor() {
    super();
    this.message = 'No message';
    this.state = {};
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
