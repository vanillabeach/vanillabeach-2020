import * as PubSub from 'pubsub-js';
import { LitElement, css, html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { DateTime } from 'luxon';
import { Config } from '../../config';
import { Photo } from '../../model/photo';
import { Signal } from '../vb-app/enums';
import { State } from '../vb-app/index';

const renderEffects = false;
const fadeDuration = Config.style.fadeDuration;

class PhotosWebComponent extends LitElement {
  private categoryPhotos: Photo[];

  static get properties() {
    return {
      content: { type: String },
    };
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.bindPubSubEvents();
    this.getCategoryPhotos();
  }

  disconnectedCallback() {
    this.unbindPubSubEvents();
  }

  attributeChangedCallback(
    name: string,
    oldval: string | null,
    newval: string | null
  ) {
    super.attributeChangedCallback(name, oldval, newval);
  }

  static get styles() {
    const photoOpacity = renderEffects ? css`var(--journalOpacity)` : css`1`;

    return css`
      :host {
        line-height: 1.5;
        font-family: var(--body-font-family);
        font-size: var(--body);
        color: var(--body-text-color);
        text-shadow: var(--body-text-shadow);
      }

      :host h1 {
        font-size: var(--h1);
      }
      :host h2 {
        font-size: var(--h2);
      }

      :host h3 {
        font-size: var(--h3);
      }

      :host h4 {
        font-size: var(--h4);
      }

      :host #photos {
        transition: opacity ${fadeDuration}ms ease-in;
        opacity: 0;
      }

      :host #photos.show {
        opacity: 1;
      }

      :host a {
        color: var(--link-color);
        font-size: var(--body) !important;
        display: inline-block;
        background-color: #00000011;
        text-decoration: none;
        padding-left: 0.2em;
        padding-right: 0.2em;
      }
    `;
  }

  render() {
    console.log('this.categoryPhotos', this.categoryPhotos);

    if (!this.categoryPhotos) {
      return html`<section id="photos">TBC</section>`;
    }

    return html`
      <section id="photos">
        <div class="frame">
          <h1>Photos</h1>
        </div>
      </section>
    `;
  }

  private bindPubSubEvents() {
    PubSub.subscribe(Signal.AppSync, (_: string, state: State) => {
      const categoryPhotos = state.pages.photosAndVideos.photos.categoryPhotos;

      if (!categoryPhotos) {
        return;
      }

      console.log('photos state', state);

      this.fadeOut(() => {
        this.categoryPhotos = [...categoryPhotos];
        this.init();
      });
    });
  }

  private unbindPubSubEvents() {
    PubSub.unsubscribe(Signal.AppSync);
  }

  private init() {
    setTimeout(() => {
      this.fadeIn();
    }, 50);
  }

  private fadeIn() {
    window.scrollTo(0, 0);
    const photosEl: HTMLElement = this.shadowRoot.querySelector('#photos');
    photosEl.classList.add('show');
  }

  private fadeOut(callback?: Function) {
    const photosEl: HTMLElement = this.shadowRoot.querySelector('#photos');
    photosEl.classList.remove('show');
    if (callback) {
      setTimeout(callback.bind(this), fadeDuration);
    }
  }

  private getCategoryPhotos() {
    PubSub.publish(Signal.CategoryPhotosRequest);
  }

  private getPhotoPath(category: string, id: string): string {
    const photoId = `${id}/XL_${id}.png`;
    return `${Config.url.server.photo.media}/${category}/${photoId}`;
  }
}

customElements.define('vb-photos', PhotosWebComponent);
