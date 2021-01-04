const serverUrl = 'http://localhost:4040/server';

interface navLabel {
  pageId: string;
  label: string;
  needsLogin?: true;
}

const navigation: { [key: string]: navLabel } = {
  journal: {
    pageId: 'journal',
    label: 'Journal',
  },
  photosAndVideos: {
    pageId: 'photos-and-videos',
    label: 'Photos & Videos',
  },
  magazine: {
    pageId: 'magazine',
    label: 'Magazine',
  },
  junk: {
    pageId: 'junk',
    label: 'Junk',
  },
};

export const Config = {
  size: {
    backgroundMax: 1280
  },
  navigation,
  url: {
    server: {    
      backgrounds: `/resources/site/backgrounds`,
      journal: {
        entry: `${serverUrl}/journal`,
        list: `${serverUrl}/journals`,
        media: `/resources/journal`,        
      },
    },
  },
};
