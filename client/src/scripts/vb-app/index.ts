import { LitElement, html } from 'lit-element';

export class App extends LitElement {
  message: string;

  static get properties() {
    return {
      message: {type: String}
    };
  }
  
  constructor() {
    super();
    this.message = 'No message';
    // this.addEventListener('stuff-loaded', (e) => { this.message = e.detail } );
  }

  connectedCallback() {
    super.connectedCallback()
  
    console.log('connected')
  }

  render() {
    return html`
      <p part="wrapper">
        Hello, ${this.message}!
        <slot></slot>
      </p>
    `;
  }
}
customElements.define('vb-app', App);
