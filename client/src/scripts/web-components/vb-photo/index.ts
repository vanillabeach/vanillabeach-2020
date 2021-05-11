import { LitElement, css, html, TemplateResult } from 'lit-element';
import { Config } from '../../config';

const fadeDuration = Config.style.fadeDuration;
const iconsUrl = Config.url.server.icons;

export class Photo extends LitElement {
  private url: string;
  private exitUrl: string;

  constructor() {
    super();
  }

  static get properties() {
    return {
      url: { type: String },
      exitUrl: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      :host .full-screen-photo {
        position: fixed;
        background: var(--content-foreground-color) url(/resources/site/decorations/spinner.svg) center center no-repeat;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: var(--section-padding);
        z-index: 1;
      }

      :host .photo {
        display: block;
        margin:auto;
        opacity: 0;
        width: 100%;
        max-width: 1920px;
        height: 100%;
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
        transition: opacity ${fadeDuration}ms ease-in;
      }

      :host .photo .icon {
        width: 100px;
        height: 64px;
        background-color: var(--content-background-color);
        border: 0px;
        border-bottom: var(--under-border-thickness) solid var(--content-foreground-color-translucent);
      }

      :host .photo .icon  img {
        width: 32px;
      }

      :host .photo.show {
        opacity: 1;
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    this.unbindEvents();
  }

  updated() {
    this.bindEvents();
  }

  render() {
    const photo = new Image();
    photo.src = this.url;
    photo.onload = this.fadeIn.bind(this);

    return html` <div class="full-screen-photo">
      <div id="photo" class="photo" style="background-image: url(${this.url})">
        <button class="icon" id="exit">
            <img src="${iconsUrl}/close.svg" title="Close" />
        </button>
      </div>
    </div>`;
  }

  private bindEvents() {
    this.bindExitEvent();
  }

  private bindExitEvent() {
    this.shadowRoot
      .querySelector('#exit')
      .addEventListener('click', this.exitEvent.bind(this));
  }

  private fadeIn() {
    setTimeout(() => {
      this.shadowRoot.querySelector('#photo').classList.add('show');
    }, Config.timing.fadeInLatency);
  }

  private unbindEvents() {
    this.unbindExitEvent();
  }

  private unbindExitEvent() {
    this.shadowRoot
      .querySelector('#exit')
      .removeEventListener('click', this.exitEvent.bind(this));
  }

  private exitEvent() {
    console.log('exitUrl', this.exitUrl);

    if (this.exitUrl) {
      document.location.hash = this.exitUrl;
    }
  }
}

customElements.define('vb-photo', Photo);
