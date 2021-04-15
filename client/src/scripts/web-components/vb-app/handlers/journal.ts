import { Journal } from '../../../model/journal';
import { JournalSummary } from '../../../model/journalSummary';
import { Config } from '../../../config';

export class JournalHandler {
  static async getJournal(id = ''): Promise<Journal> {
    const basePath = Config.url.server.journal.entry;
    const url = id === '' ? basePath : `${basePath}?id=${id}`;
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

  static async getJournalList(): Promise<JournalSummary[]> {
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
