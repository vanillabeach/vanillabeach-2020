import * as PubSub from 'pubsub-js';
import { LitElement, TemplateResult, css, html } from 'lit-element';
import { Config } from '../../config';
import { Photo } from '../../model/photo';
import { Signal } from '../vb-app/enums';
import { State } from '../vb-app/index';

const renderEffects = false;
const fadeDuration = Config.style.fadeDuration;

class PhotosWebComponent extends LitElement {
  private photosById: { [key: string]: Photo };
  private category: string;
  private pageId: string;
  private albumTiles: TemplateResult[];
  private albumTitle: string;

  constructor() {
    super();
    this.pageId = Config.navigation.photosAndVideos.pageId;
  }

  static get properties() {
    return {
      category: { type: String, reflect: true },
      pageId: { type: String },
      albumTiles: {type: Array,  attribute: false },
      albumTitle: {type: String,  attribute: false}
    };
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

      :host .photo-categories {
        display: flex;
        padding-left: 20px;
        padding-right: 20px;
      }

      :host .photo-category {
        flex: 1;
        height: 200px;
        box-sizing: border-box;
        padding-left: 10px;
        padding-right: 10px;
        padding-bottom: 20px;
      }

      :host .photo-category:first-of-type {
        padding-left: 0px;
      }

      :host .photo-category:last-of-type {
        padding-right: 0px;
      }

      :host #photos {
        transition: opacity ${fadeDuration}ms ease-in 2s;
        opacity: 0;
      }

      :host #photos.show {
        transition: ease-in;
        opacity: 1;
      }

      :host #photos .category {
        width: 300px;
        height: 200px;
        border: 1px solid black;
        background-size: cover;
        background-position: center center;
      }

      :host #photos .photos-header {
        -webkit-font-smoothing: antialiased;
        font-family: var(--header-font-family);
        text-align: center;
        text-transform: uppercase;
        padding-top: 10px;
      }

      :host #photos .photos-header .photos-title {
        color: var(--content-foreground-color);
        font-weight: 100;
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

  connectedCallback() {
    super.connectedCallback();
    this.bindPubSubEvents();
    this.getPhotos();
  }

  disconnectedCallback() {
    this.unbindPubSubEvents();
  }

  attributeChangedCallback(
    name: string,
    oldval: string | null,
    newval: string | null
  ) {
    if (name === 'category') {
      this.photosById = {};
      this.getPhotos(newval);
    }
    super.attributeChangedCallback(name, oldval, newval);
  }

  render() {
    if (this.albumTiles === undefined) {
      return html``;
    }

    return html`
      <section id="photos" class="show">
        <div class="frame">
        <header class="photos-header">
          <h2 class="photo-title">${this.albumTitle}</h2>
        </header>     
          ${this.albumTiles}                                    
      </section>`;
  }

  private bindPubSubEvents() {
    PubSub.subscribe(
      Signal.UrlChange,
      (category: string, page: { name: string; param: string }) => {
        if (page.name !== this.pageId) {
          return;
        }
        this.fadeOut(() => {
          this.category = decodeURIComponent(page.param);
          this.fadeIn();
        });
      }
    );

    PubSub.subscribe(Signal.AppSync, (_: string, state: State) => {
      const categories = state.pages.photosAndVideos.photos.categories;
      if (!categories) {
        return;
      }
      const contentIds = categories.map((photo: Photo) => photo.id);

      let photosById: { [key: string]: Photo } = {};
      categories.forEach((photo: Photo) => {
        photosById[photo.id] = photo;
      });
      this.photosById = photosById;
      this.setAlbumTiles(contentIds);
      this.setAlbumTitleTitle();
    });
  }

  private unbindPubSubEvents() {
    PubSub.unsubscribe(Signal.AppSync);
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

  private getPhotos(category?: string) {
    PubSub.publish(Signal.PhotosRequest, category);
  }

  private getPhotoPath(category: string, id: string): string {
    const photoId = `${id}/${id}_small.jpg`;
    const path = `${Config.url.server.photo.media}/${category}/${photoId}`;
    return encodeURI(path);
  }

  private setAlbumTiles(photoIds: string[]) {
    const numberOfColumns = this.category ? 4 : 2;
    const photoIdsByRow: string[][] = [];
    let accumulator: string[] = [];

    photoIds.forEach((id: string, index: number) => {
      if (index !== 0 && index % numberOfColumns === 0) {
        photoIdsByRow.push(accumulator);
        accumulator = [id];
      } else {
        accumulator.push(id);
      }
    });
    if (accumulator.length > 0) {
      photoIdsByRow.push(accumulator);
    }

    this.albumTiles = photoIdsByRow.map((photos: string[]) => html`
        <div class="photo-categories">
          ${photos.map((key: string) => {
            const { category, id } = this.photosById[key];
            const url = this.getPhotoPath(category, id);
            const categoryId = encodeURIComponent(category.toLowerCase());
            const href = `${this.pageId}/${categoryId}`;

            if (this.category) {
              return html`
                <div class="photo-category">
                  <vb-photo-thumbnail
                    name="${category}"
                    src="${url}"
                    href="${href}"
                  ></vb-photo-thumbnail>
                </div>
              `;
            }

            return html`
              <div class="photo-category">
                <vb-photo-category
                  name="${category}"
                  src="${url}"
                  href="${href}"
                ></vb-photo-category>
              </div>
            `;
          })}
        </div>
      `);
  }

  private setAlbumTitleTitle() {
    this.albumTitle = this.category ? this.category : 'Albums';
  }
}

customElements.define('vb-photos', PhotosWebComponent);
