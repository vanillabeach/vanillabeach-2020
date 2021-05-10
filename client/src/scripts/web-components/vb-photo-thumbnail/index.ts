import { LitElement, css, html } from 'lit-element';
import { Config } from '../../config';

const fadeDuration = Config.style.fadeDuration;

export class PhotoThumbnailWebComponent extends LitElement {
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
      .photo-thumbnail {
        opacity: 0
        width: 100%;
        height: 100%;
        display: block;
        position: relative;
        outline: none;
        cursor: pointer;
        overflow: hidden;
        background-position: center center;
        background-size: cover;
        transition: opacity ${fadeDuration}ms ease-in;
        opacity: 0;
      }

      .photo-thumbnail.show {
        opacity: 1;
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
      <div id="photo-thumbnail" 
           class="photo-thumbnail"
           style="background-image: url(${this.src})"></div>
    `;
  }

  private bindEvents() {
    const container: HTMLElement = this.shadowRoot.querySelector(
      '#photo-thumbnail'
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
      '#photo-thumbnail'
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
      '#photo-thumbnail'
    );      
    const delay = (args.randomise === true) ? Math.ceil(Math.random() * 500) : 0;

    setTimeout(doFade, delay);
  }

  private viewPhoto() {
    document.location.hash = this.href;
  }
}

customElements.define('vb-photo-thumbnail', PhotoThumbnailWebComponent);
