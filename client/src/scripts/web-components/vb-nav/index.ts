import { LitElement, css, html, TemplateResult } from 'lit-element';
import { Config } from '../../config';

export class Nav extends LitElement {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  static get styles() {
    return css`
      :host section {
        max-width: var(--default-width);
        text-align: right;
        display: block;
        margin: auto;
      }
     
      :host span {
        display: inline-block;
        margin-right: 10px;
        padding-right: 10px;
        border-right: 1px solid var(--background-color);
        color: var(--background-color);
        text-align: right;
      }

      :host span:last-of-type {
        padding-right: 0;
        border-right: 0;
        margin-right: 0;
      }
    `;
  }

  private get links(): TemplateResult[] {
    const navigation = Config.navigation;
    const linkKeys = Object.keys(navigation);

    return linkKeys.map(
      (key: string) => html`<span>${navigation[key].label}</span>`
    );
  }

  render() {
    return html`<section>${this.links}</section>`;
  }
}
customElements.define('vb-nav', Nav);
