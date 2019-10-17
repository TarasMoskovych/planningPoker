import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { Vote } from './../models';

import * as firebase from 'firebase/app';

import { SessionService } from './session.service';
import { Card } from '../models';

@Injectable({
  providedIn: 'root'
})
export class VoteService {

  constructor(private afs: AngularFirestore, private sessionService: SessionService) { }

  createVoteCollection(sessionId: string, ticketId: string) {
    return this.afs.collection('votes').add({ sessionId, ticketId });
  }

  vote(userId: string, card: Card, ticketId: string): Observable<void> {
    return this.getVotesCollectionByTicketId(ticketId)
      .get()
      .pipe(
        switchMap((snapshot: firebase.firestore.QuerySnapshot) => {
          return this.afs.doc(`votes/${snapshot.docs[0].id}`).collection('results').doc(userId).set(card);
        })
      );
  }

  getResults(ticketId: string) {
    return this.getVotesCollectionByTicketId(ticketId)
      .get()
      .pipe(
        switchMap((snapshot: firebase.firestore.QuerySnapshot) => {
          return this.afs.doc(`votes/${snapshot.docs[0].id}`).collection('results').valueChanges();
        })
      );
  }

  getVoteByTicketId(ticketId: string): Observable<Vote> {
    return this.getVotesCollectionByTicketId(ticketId)
      .get()
      .pipe(
        switchMap((snapshot: firebase.firestore.QuerySnapshot) => {
          return this.afs.doc(`votes/${snapshot.docs[0].id}`).valueChanges();
        })
      );
  }

  finishVoting(ticketId: string): Observable<void> {
    return this.getVotesCollectionByTicketId(ticketId)
      .get()
      .pipe(
        switchMap((snapshot: firebase.firestore.QuerySnapshot) => {
          return this.afs.doc(`votes/${snapshot.docs[0].id}`).update({ voted: true });
        })
      );
  }

  private getVotesCollectionByTicketId(ticketId: string): AngularFirestoreCollection {
    return this.afs.collection('votes', (ref: firebase.firestore.CollectionReference) => ref
      .where('sessionId', '==', this.sessionService.getSessionId())
      .where('ticketId', '==', ticketId));
  }
}