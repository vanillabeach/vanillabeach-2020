import * as PubSub from 'pubsub-js';

import { Journal } from '../../model/journal';
import { JournalSummary } from '../../model/journalSummary';
import { Config } from '../../config';

export class AppFileHandler {
  static async journalEntry(id = ''): Promise<Journal> {
    const url = id === '' 
      ? Config.url.server.journal.entry
      : `${Config.url.server.journal.entry}?id=${id}`;
    let result: Journal = null;

    await fetch(url, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        result = data as Journal;
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    return result;
  }

  static async journalList(): Promise<JournalSummary[]> {
    const url = Config.url.server.journal.list;
    let result: JournalSummary[] = null;

    await fetch(url, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        result = data[''] as JournalSummary[];
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    return result;
  }
}
