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
        padding-left: 15px;
        padding-right: 15px;
        padding-top: 5px;
        padding-bottom: 5px;
        border: 1px solid var(--background-color);
        border-bottom: solid var(--background-color);
        color: var(--background-color);
        text-align: right;
        cursor: pointer;
        outline: none;
      }

      :host span a {
        color: var(--background-color);
        text-decoration: none;
      }
      
      :host span:last-of-type {
        margin-right: 0;
      }
    `;
  }

  private get links(): TemplateResult[] {
    const navigation = Config.navigation;
    const linkKeys = Object.keys(navigation);

    return linkKeys.map(
      (key: string) => html`
        <span><a href="#${navigation[key].pageId}">${navigation[key].label}</a></span>
        `
    );
  }

  render() {
    return html`<section>${this.links}</section>`;
  }
}
customElements.define('vb-nav', Nav);
