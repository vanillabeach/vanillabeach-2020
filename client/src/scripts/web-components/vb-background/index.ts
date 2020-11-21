import { LitElement, css, html } from 'lit-element';
import { Config } from '../../config';

export class Background extends LitElement {
  private backgroundImage: HTMLImageElement;
  private foregroundImage: HTMLImageElement;
  private canPaint: boolean;

  constructor() {
    super();
    this.canPaint = false;
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
    if (this.canPaint === false) {
      return;
    }

    const muralEl: HTMLCanvasElement = this.shadowRoot.querySelector('#mural');
    const ctx = muralEl.getContext('2d');
    const parallaxRatio = (muralEl.offsetHeight / window.innerHeight) * -1;
    const imageRatio =
      this.foregroundImage.width < this.foregroundImage.height
        ? this.foregroundImage.height / this.foregroundImage.width
        : this.foregroundImage.width / this.foregroundImage.height;

    const muralWidth = muralEl.offsetWidth;
    const muralHeight = muralEl.offsetWidth * imageRatio;

    ctx.drawImage(
      this.backgroundImage,
      0,
      window.scrollY * parallaxRatio * 0.55,
      muralWidth,
      muralHeight
    );
    ctx.drawImage(
      this.foregroundImage,
      0,
      window.scrollY * parallaxRatio * 0.75,
      muralWidth,
      muralHeight
    );
  }

  private resizeMural() {
    const muralEl: HTMLElement = this.shadowRoot.querySelector('#mural');
    const width = Math.min(window.innerWidth, 1200);
    const height = window.innerHeight;

    muralEl.setAttribute('width', `${width}`);
    muralEl.setAttribute('height', `${height}`);
    this.paintMural();
  }

  private init() {
    const muralEl: HTMLCanvasElement = this.shadowRoot.querySelector('#mural');
    function checkBackgroundsHaveLoaded() {
      if (this.backgroundImage.width > 0 && this.foregroundImage.width > 0) {
        this.canPaint = true;
        this.resizeMural();
        setTimeout(() => muralEl.classList.add('show'), 500);
      }
    }

    muralEl.classList.remove('show');
    
    this.canPaint = false;
    this.backgroundImage = new Image();
    this.foregroundImage = new Image();
    this.backgroundImage.src = `${Config.url.server.backgrounds}/bg-underlay-home.png`;
    this.foregroundImage.src = `${Config.url.server.backgrounds}/bg-mask.png`;
    this.backgroundImage.onload = checkBackgroundsHaveLoaded.bind(this);
    this.foregroundImage.onload = checkBackgroundsHaveLoaded.bind(this);
  }

  updated() {
    this.init();
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
        opacity: 0.1;
      }

      :host canvas {
        transition: opacity 0.2s ease-in;
        display: block;
        margin: auto;
        opacity: 0;
      }

      :host canvas.show {
        opacity: 1;
      }
    `;
  }

  render() {
    return html`<canvas id="mural" class="mural"></canvas>`;
  }
}
customElements.define('vb-background', Background);
