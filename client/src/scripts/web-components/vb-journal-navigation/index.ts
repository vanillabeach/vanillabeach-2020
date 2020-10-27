import { LitElement, css, html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { JournalSummary } from '../../model/journalSummary';
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
      'JournalNavigationResponse',
      (_:string, journals: Promise<JournalSummary[]>) => {

        journals.then((data:JournalSummary[]) => {
          this.journalList = this.renderJournalList(data);
          console.log('journalList', this.journalList);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      }
    );
  }

  private getJournals() {
    PubSub.publish(
      'JournalNavigationRequest',
    );
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
