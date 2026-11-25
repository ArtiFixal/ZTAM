import {
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useParams } from 'react-router-dom';

import { usePeopleStore } from '../store/peopleStore';

const PersonDetail: React.FC = () => {
  const { id } = useParams();
  const person = usePeopleStore((s) => s.people.find((p) => p.id === Number(id)));
  const toggleFollowing = usePeopleStore((s) => s.toggleFollowing);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab1" />
          </IonButtons>
          <IonTitle>{person ? `${person.name} ${person.surname}` : 'Brak osoby'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding ion-text-center">
        {!person && <p>Nie ma osoby o numerze {id}.</p>}
        {person && (
          <>
            <IonAvatar style={{ width: 120, height: 120, margin: '16px auto' }}>
              <img src={person.avatar} alt="" />
            </IonAvatar>
            <h1>
              {person.name} {person.surname}
            </h1>
            <IonButton fill={person.following ? 'solid' : 'outline'} onClick={() => toggleFollowing(person.id)}>
              {person.following ? 'Obserwujesz' : 'Obserwuj'}
            </IonButton>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PersonDetail;
