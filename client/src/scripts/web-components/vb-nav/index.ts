import { LitElement, css, html, TemplateResult } from 'lit-element';
import { Config } from '../../config';

export class Nav extends LitElement {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    console.log('connected as well');
  }

  static get styles() {
    return css`
      :host span {
        display: inline-block;
        margin-right: 10px;
        padding-right: 10px;
        border-right: 1px solid #fff;
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
