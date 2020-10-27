import * as PubSub from 'pubsub-js';

import { JournalSummary } from '../../model/journalSummary';
import { Config } from '../../config';

export class AppFileHandler {
  static async journalList(): Promise<JournalSummary[]> {
    const url = Config.url.server.journalSummaryList;
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
