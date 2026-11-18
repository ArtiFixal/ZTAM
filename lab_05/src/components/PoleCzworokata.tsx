import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonInput,
  IonItem,
  IonRow,
} from '@ionic/react';
import { useRef, useState } from 'react';

const PoleCzworokata: React.FC = () => {
  const aRef = useRef<HTMLIonInputElement>(null);
  const bRef = useRef<HTMLIonInputElement>(null);
  const cRef = useRef<HTMLIonInputElement>(null);
  const dRef = useRef<HTMLIonInputElement>(null);
  const alfaRef = useRef<HTMLIonInputElement>(null);
  const gammaRef = useRef<HTMLIonInputElement>(null);
  const [wynik, setWynik] = useState<string>();

  const odczytaj = (ref: React.RefObject<HTMLIonInputElement | null>): number => {
    const wartosc = ref.current?.value;
    if (wartosc === undefined || wartosc === null || String(wartosc).trim() === '') {
      return NaN;
    }
    return +wartosc;
  };

  const oblicz = () => {
    const [a, b, c, d] = [aRef, bRef, cRef, dRef].map(odczytaj);
    const alfa = odczytaj(alfaRef);
    const gamma = odczytaj(gammaRef);

    if ([a, b, c, d].some((bok) => !(bok > 0))) {
      setWynik('Podaj dodatnie długości wszystkich boków');
      return;
    }
    if ([alfa, gamma].some((kat) => !(kat > 0 && kat < 360))) {
      setWynik('Kąty muszą być z przedziału (0°, 360°)');
      return;
    }

    const s = (a + b + c + d) / 2;
    const polowaSumy = ((alfa + gamma) / 2) * (Math.PI / 180);
    const cos = Math.cos(polowaSumy);
    const podPierwiastkiem = (s - a) * (s - b) * (s - c) * (s - d) - a * b * c * d * cos * cos;

    if (!(podPierwiastkiem > 0)) {
      setWynik('Taki czworokąt nie istnieje');
      return;
    }
    setWynik(`Pole: ${Math.sqrt(podPierwiastkiem).toFixed(2).replace('.', ',')}`);
  };

  const pola = [
    { ref: aRef, label: 'Bok a' },
    { ref: bRef, label: 'Bok b' },
    { ref: cRef, label: 'Bok c' },
    { ref: dRef, label: 'Bok d' },
    { ref: alfaRef, label: 'Kąt α między a i d (°)' },
    { ref: gammaRef, label: 'Kąt γ między b i c (°)' },
  ];

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Pole czworokąta</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonGrid>
          {pola.map((pole) => (
            <IonRow key={pole.label}>
              <IonCol>
                <IonItem>
                  <IonInput label={pole.label} labelPlacement="floating" type="number" ref={pole.ref} />
                </IonItem>
              </IonCol>
            </IonRow>
          ))}
          <IonRow>
            <IonCol>
              <IonButton expand="block" onClick={oblicz}>
                Oblicz pole
              </IonButton>
            </IonCol>
          </IonRow>
          {wynik && (
            <IonRow>
              <IonCol>
                <h2>{wynik}</h2>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonCardContent>
    </IonCard>
  );
};

export default PoleCzworokata;
