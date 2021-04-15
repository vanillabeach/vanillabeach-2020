import { LitElement, PropertyValues, css, html } from 'lit-element';
import * as PubSub from 'pubsub-js';
import { JournalHandler } from './handlers/journal';
import { PhotoHandler } from './handlers/photo';
import { Config } from '../../config';
import { Journal } from '../../model/journal';
import { JournalSummary } from '../../model/journalSummary';
import { Photo } from '../../model/photo';
import { Signal } from './enums';
import { Navigation, PageUrl } from './navigation';

const fadeDuration = Config.style.fadeDuration;

export type State = {
  intervalIds: {
    navigation: number;
  };
  pages: {
    journal: {
      entry: Journal;
      navigation: JournalSummary[];
    };
    photosAndVideos: {
      photos: {
        categories: Photo[];
        photosInCategory: Photo[];
      };
    };
  };
  user: {
    selectedPage: string;
  };
};

export class App extends LitElement {
  private state: State;

  constructor() {
    super();
    this.init();
  }

  static get properties() {
    return {
      state: {
        attribute: false,
      },
    };
  }

  static get styles() {
    return css`
      :host .site {
        max-width: var(--default-width);
        margin: auto;
        background-color: var(--content-background-color);
        box-sizing: border-box;
        box-shadow: 1px 0px 30px var(--shadow-faint-color);
      }
    `;
  }

  updated(changedProperties: PropertyValues) {
    console.log('state', this.state);
  }

  connectedCallback() {
    super.connectedCallback();
  }

  render() {
    return html`
      <vb-background class="background"></vb-background>
      <section class="site">
        <slot></slot>
      </section>
    `;
  }

  private bindPubSubEvents() {
    PubSub.subscribe(Signal.JournalNavigationRequest, async () => {
      const journalList = await JournalHandler.getJournalList();

      this.state.pages.journal.navigation = journalList;
      this.state = { ...this.state };
      this.broadcastState();
    });

    PubSub.subscribe(Signal.PhotosRequest, async (_: string, category: string) => {
      const categoryPhotos = await PhotoHandler.getPhotos(category);
      this.state.pages.photosAndVideos.photos.categories = categoryPhotos;
      this.state = { ...this.state };
      this.broadcastState();
    });

    PubSub.subscribe(Signal.UrlChange, async (_: string, id: PageUrl) => {
      const navigation = Config.navigation;
      const selectedPage = id.name;

      this.state.user.selectedPage = selectedPage;
      if (id.name === navigation.journal.pageId) {
        const journalId = id.param as string;
        const journalEntry = await JournalHandler.getJournal(journalId);
        this.state.pages.journal.entry = journalEntry;
      }

      this.switchPage(this.state.user.selectedPage);
      this.state = { ...this.state };
      this.broadcastState();
    });
  }

  private broadcastState() {
    PubSub.publish(Signal.AppSync, this.state);
  }

  private getInitialState(): State {
    const navigation = new Navigation();

    return {
      intervalIds: {
        navigation: navigation.init(),
      },
      pages: {
        journal: {
          navigation: null,
          entry: null,
        },
        photosAndVideos: {
          photos: {
            categories: null,
            photosInCategory: null,
          },
        },
      },
      user: {
        selectedPage: null,
      },
    };
  }

  private init() {
    this.state = this.getInitialState();
    this.bindPubSubEvents();
  }

  private switchPage(pageId: string) {
    console.log('switchPage', pageId);
    const pages = [].slice.call(this.querySelectorAll('vb-page'));

    pages.forEach((page: HTMLElement) => {
      if (page.getAttribute('id') === pageId) {
        setTimeout(() => {
          page.classList.add('show');
        }, fadeDuration);
      } else {
        page.classList.remove('show');
      }
    });
  }
}

customElements.define('vb-app', App);
