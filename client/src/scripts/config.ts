const serverUrl = 'http://localhost:4040/server';

interface navLabel {
  label: string;
  needsLogin?: true;
}

const navigation: { [key: string]: navLabel } = {
  journal: {
    label: 'Journal',
  },
  photosAndVideos: {
    label: 'Photos & Videos',
  },
  magazine: {
    label: 'Magazine',
  },
  junk: {
    label: 'Junk',
  },
};

export const Config = {
  navigation,
  url: {
    server: {
      journal: {
        entry: `${serverUrl}/journal`,
        list: `${serverUrl}/journals`,
        media: `${serverUrl}/media/journal`,
      },
    },
  },
};
