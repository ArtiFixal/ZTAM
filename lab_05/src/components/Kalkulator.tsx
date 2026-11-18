import { IonAlert, IonButton, IonCard, IonCardContent, IonCol, IonGrid, IonRow } from '@ionic/react';
import { useState } from 'react';

const DZIALANIA = ['÷', '×', '−', '+'];
const UKLAD_PRZYCISKOW = [
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '−'],
  ['C', '0', '.', '+'],
];

const policz = (a: number, b: number, dzialanie: string): number | null => {
  let wynik: number;
  switch (dzialanie) {
    case '÷':
      if (b === 0) {
        return null;
      }
      wynik = a / b;
      break;
    case '×':
      wynik = a * b;
      break;
    case '−':
      wynik = a - b;
      break;
    default:
      wynik = a + b;
  }
  return parseFloat(wynik.toFixed(10));
};

const Kalkulator: React.FC = () => {
  const [pokazAlert, setPokazAlert] = useState(false);
  const [wyswietlacz, setWyswietlacz] = useState('0');
  const [poprzedniaLiczba, setPoprzedniaLiczba] = useState<number | null>(null);
  const [dzialanie, setDzialanie] = useState<string | null>(null);
  const [nowaLiczba, setNowaLiczba] = useState(true);

  const wyczysc = () => {
    setWyswietlacz('0');
    setPoprzedniaLiczba(null);
    setDzialanie(null);
    setNowaLiczba(true);
  };

  const pokazBlad = () => {
    wyczysc();
    setPokazAlert(true);
  };

  const wpiszCyfre = (cyfra: string) => {
    if (nowaLiczba || wyswietlacz === '0') {
      setWyswietlacz(cyfra);
    } else {
      setWyswietlacz(wyswietlacz + cyfra);
    }
    setNowaLiczba(false);
  };

  const wpiszKropke = () => {
    if (nowaLiczba) {
      setWyswietlacz('0.');
      setNowaLiczba(false);
    } else if (!wyswietlacz.includes('.')) {
      setWyswietlacz(wyswietlacz + '.');
    }
  };

  const wybierzDzialanie = (noweDzialanie: string) => {
    let liczba = parseFloat(wyswietlacz);
    if (poprzedniaLiczba !== null && dzialanie !== null && !nowaLiczba) {
      const wynik = policz(poprzedniaLiczba, liczba, dzialanie);
      if (wynik === null) {
        pokazBlad();
        return;
      }
      liczba = wynik;
      setWyswietlacz(String(wynik));
    }
    setPoprzedniaLiczba(liczba);
    setDzialanie(noweDzialanie);
    setNowaLiczba(true);
  };

  const pokazWynik = () => {
    if (poprzedniaLiczba === null || dzialanie === null) {
      setNowaLiczba(true);
      return;
    }
    const wynik = policz(poprzedniaLiczba, parseFloat(wyswietlacz), dzialanie);
    if (wynik === null) {
      pokazBlad();
      return;
    }
    wyczysc();
    setWyswietlacz(String(wynik));
  };

  const kliknij = (przycisk: string) => {
    if (przycisk === 'C') {
      wyczysc();
    } else if (przycisk === '.') {
      wpiszKropke();
    } else if (DZIALANIA.includes(przycisk)) {
      wybierzDzialanie(przycisk);
    } else {
      wpiszCyfre(przycisk);
    }
  };

  return (
    <IonCard>
      <IonCardContent>
        <h1 className="ion-text-right" style={{ overflowWrap: 'anywhere' }}>
          {wyswietlacz}
        </h1>
        <IonGrid>
          {UKLAD_PRZYCISKOW.map((wiersz) => (
            <IonRow key={wiersz.join('')}>
              {wiersz.map((przycisk) => (
                <IonCol size="3" key={przycisk}>
                  <IonButton
                    expand="block"
                    color={DZIALANIA.includes(przycisk) ? 'secondary' : 'medium'}
                    onClick={() => kliknij(przycisk)}
                  >
                    {przycisk}
                  </IonButton>
                </IonCol>
              ))}
            </IonRow>
          ))}
          <IonRow>
            <IonCol>
              <IonButton expand="block" onClick={pokazWynik}>
                =
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonAlert
          isOpen={pokazAlert}
          header="Błąd"
          message="Nie można dzielić przez zero"
          buttons={['OK']}
          onDidDismiss={() => setPokazAlert(false)}
        />
      </IonCardContent>
    </IonCard>
  );
};

export default Kalkulator;
