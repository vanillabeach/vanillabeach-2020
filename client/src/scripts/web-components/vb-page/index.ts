import { LitElement, html } from 'lit-element';

export class Page extends LitElement {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    console.log('page conntect');
  }

  render() {
    return html`
      <section>
        <slot></slot>
      </section>
    `;
  }
}
customElements.define('vb-page', Page);
