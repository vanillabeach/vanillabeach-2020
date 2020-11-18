import { LitElement, css, html } from 'lit-element';
import { Config } from '../../config';

export class Background extends LitElement {
  private backgroundImage: HTMLImageElement;

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.bindWindowEvents();
  }

  disconnectedCallback() {
    this.unbindWindowEvents();
  }

  private bindWindowEvents() {
    window.addEventListener('scroll', this.paintMural.bind(this));
    window.addEventListener('resize', this.resizeMural.bind(this));
  }

  private paintMural() {
    const bodyEl: HTMLElement = document.querySelector('body');

    const muralEl: HTMLCanvasElement = this.shadowRoot.querySelector('#mural');
    const ctx = muralEl.getContext('2d');
    const bgImage: HTMLImageElement = new Image();
    const fgImage: HTMLImageElement = new Image();
    const parallaxRatio = -1;

    console.log('parallax', window.scrollY * parallaxRatio);

    bgImage.onload = () => {
      fgImage.onload = () => {
        const imageRatio =
          fgImage.width < fgImage.height
            ? fgImage.height / fgImage.width
            : fgImage.width / fgImage.height;

        ctx.drawImage(
          bgImage,
          0,
          window.scrollY * parallaxRatio * 0.5,
          muralEl.offsetWidth,
          muralEl.offsetWidth * imageRatio
        );
        ctx.drawImage(
          fgImage,
          0,
          window.scrollY * parallaxRatio * 0.7,
          muralEl.offsetWidth,
          muralEl.offsetWidth * imageRatio
        );
      };
    };

    bgImage.src = `${Config.url.server.backgrounds}/bg-underlay-home.png`;
    fgImage.src = `${Config.url.server.backgrounds}/bg-mask.png`;
  }

  private resizeMural() {
    const muralEl: HTMLElement = this.shadowRoot.querySelector('#mural');
    const width = Math.min(window.innerWidth, 1200);
    const height = window.innerHeight;

    muralEl.setAttribute('width', `${width}`);
    muralEl.setAttribute('height', `${height}`);
    this.paintMural();
  }

  updated() {
    this.resizeMural();
  }

  private unbindWindowEvents() {
    window.removeEventListener('scroll', this.paintMural.bind(this));
    window.addEventListener('resize', this.resizeMural.bind(this));
  }

  static get styles() {
    return css`
      :host {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: -100;
        overflow: hidden;
        opacity: 0.15;
      }

      :host canvas {
        display: block;
        margin: auto;
      }
    `;
  }

  render() {
    return html`<canvas id="mural" class="mural"></canvas>`;
  }
}
customElements.define('vb-background', Background);
