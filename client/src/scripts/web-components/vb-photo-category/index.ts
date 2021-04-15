import { LitElement, css, html } from 'lit-element';
import { Config } from '../../config';

const fadeDuration = Config.style.fadeDuration;

export class PhotoCategoryWebComponent extends LitElement {
  private name: string;
  private src: string;
  private href: string;

  static get properties() {
    return {
      name: { type: String },
      src: { type: String },
      href: { type: String },
    };
  }

  static get styles() {
    return css`
      .photo-category {
        width: 100%;
        height: 100%;
        display: block;
        position: relative;
        outline: none;
        cursor: pointer;
        overflow: hidden;
      }

      :host .foreground,
      :host .background {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
      }

      :host .foreground {
        z-index: 1;
        box-sizing: border-box;
        vertical-align: baseline;
      }

      :host .foreground .name {
        position: absolute;
        bottom: 0px;
        width: 100%;
        height: 33%;
        background-color: var(--content-foreground-color-light-translucent);
        padding: calc(var(--section-padding) / 2);
        box-sizing: border-box;
      }

      :host .background {
        transition: opacity ${fadeDuration}ms ease-in;
        z-index: 0;
        background-size: cover;
        filter: blur(2px);
        transform: scale(1.1);
        opacity: 0;
      }

      :host .background.show {
        opacity: 1;
      }

      :host h3 {
        font-family: var(--header-font-family);
        line-height: 1;
        text-transform: uppercase;
      }
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unbindEvents();
  }

  updated() {
    this.bindEvents();
  }

  render() {
    return html`
      <div id="photo-category" class="photo-category">
        <div class="foreground">
          <div class="name">
            <h3>${this.name}</h3>
          </div>
        </div>
        <div id="background" 
             class="background" 
             style="background-image: url(${this.src})"></div>
      </div>
    `;
  }

  private bindEvents() {
    const container: HTMLElement = this.shadowRoot.querySelector(
      '#photo-category'
    );
    if (container) {
      container.addEventListener('click', this.viewPhoto.bind(this));
    }

    const photoImageEl = new Image();
    photoImageEl.onload = () => this.fadeIn({randomise: true});
    if (photoImageEl) {
      photoImageEl.src = this.src;
    }
  }

  private unbindEvents() {
    const container: HTMLElement = this.shadowRoot.querySelector(
      '#photo-category'
    );
    if (container) {
      container.removeEventListener('click', this.viewPhoto.bind(this));
    }
  }

  private fadeIn(args : {randomise: boolean}) {
    function doFade() {
      photoImageEl.classList.add('show')
    };
    const photoImageEl: HTMLImageElement = this.shadowRoot.querySelector(
      '#background'
    );      
    const delay = (args.randomise === true) ? Math.ceil(Math.random() * 500) : 0;

    setTimeout(doFade, delay);
  }

  private viewPhoto() {
    document.location.hash = this.href;
  }
}

customElements.define('vb-photo-category', PhotoCategoryWebComponent);
