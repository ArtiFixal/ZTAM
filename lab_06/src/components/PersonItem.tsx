import { IonAvatar, IonButton, IonItem, IonLabel } from '@ionic/react';

import type { Person } from '../data/people';
import { usePeopleStore } from '../store/peopleStore';

const PersonItem: React.FC<{ person: Person }> = ({ person }) => {
  const toggleFollowing = usePeopleStore((s) => s.toggleFollowing);

  return (
    <IonItem lines="full" routerLink={`/tab1/${person.id}`}>
      <IonAvatar slot="start">
        <img src={person.avatar} alt="" />
      </IonAvatar>
      <IonLabel>
        <h2>{person.name}</h2>
        <p>{person.surname}</p>
      </IonLabel>
      <IonButton
        slot="end"
        fill={person.following ? 'solid' : 'outline'}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFollowing(person.id);
        }}
      >
        {person.following ? 'Obserwujesz' : 'Obserwuj'}
      </IonButton>
    </IonItem>
  );
};

export default PersonItem;
