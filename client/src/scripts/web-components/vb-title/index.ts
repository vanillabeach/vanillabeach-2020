import { LitElement, css, html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export class Title extends LitElement {
  title: string;

  constructor() {
    super();
  }

  static get properties() {
    return {
      title: { type: String },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.getTitle();
  }

  static get styles() {
    return css`
      :host h1 {
        font-family: var(--headerFontFamily);
        font-size: 400%;
        margin: 0;
        padding: 0;
        line-height: 1;
      }

      :host .container {
        position: relative;
        display: block;
      }

      :host .beam {
        position: absolute;
        background-color: white;
        top: 18px;
        height: 33px;
        z-index: -1;
      }

      :host h1 span.odd {
        text-transform: uppercase;
        color: red;
      }

      :host h1 span.even {
        text-transform: lowercase;
        color: blue;
      }
    `;
  }

  private getTitle() {
    const text = this.textContent
      .trim()
      .split('')
      .map((x: string, index: number) =>
        index % 2 == 0
          ? `<span class="odd">${x}</span>`
          : `<span class="even">${x}</span>`
      )
      .join('');

    this.setAttribute('title', text);
    this.innerHTML = '';
  }

  updated() {
    const beamEl = this.shadowRoot.querySelector('.beam') as HTMLElement;
    const h1El = this.shadowRoot.getElementById('width-calc');

    beamEl.style.width = `${h1El.offsetWidth}px`;
  }

  render() {
    return html`
      <section class="container">
        <div class="beam"></div>
        <h1><span id="width-calc">${unsafeHTML(this.title)}</span></h1>
        <slot></slot>
      </section>
    `;
  }
}
customElements.define('vb-title', Title);
