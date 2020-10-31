import { LitElement, css, html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { JournalSummary } from '../../model/journalSummary';
import { State } from '../vb-app/index';
import * as PubSub from 'pubsub-js';

export class JournalNavigation extends LitElement {
  selectedJournal: string;
  hasLoaded: boolean;
  private journalList: string;

  static get properties() {
    return {
      hasLoaded: { type: Boolean },
      journalList: {type: String},
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

  private bindPubSubEvents() {    
    PubSub.subscribe(
      'AppSync',
      (_:string, state: State) => {
          this.journalList = this.renderJournalList(state.journals.list);
          console.log('journalList', this.journalList);  
      }
    );
  }

  private unbindPubSubEvents() {
    PubSub.unsubscribe('AppSync');
  }

  private getJournals() {
    PubSub.publish('JournalNavigationRequest');
  }

  private renderJournalList(journalList:JournalSummary[]): string {
    console.log('renderJournalList', journalList);

    if (!journalList) {
      return ``;
    }

    const html = journalList
      .map((x: JournalSummary) => `<option>${x.title}</option>`)
      .join('');
    return `${html}`;
  }

  constructor() {
    super();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unbindPubSubEvents();
  }

  connectedCallback() {
    super.connectedCallback();
    this.bindPubSubEvents();
    this.getJournals();
  }

  render() {
    return html`<select>
      ${unsafeHTML(this.journalList)}
    </select>`;
  }
}
customElements.define('vb-journal-navigation', JournalNavigation);
