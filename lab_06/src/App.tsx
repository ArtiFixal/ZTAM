import {
  IonApp,
  IonBadge,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { create, heart, people } from 'ionicons/icons';
import { Navigate, Route } from 'react-router-dom';

import PersonDetail from './pages/PersonDetail';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import { usePeopleStore } from './store/peopleStore';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const lista = usePeopleStore((s) => s.people);
  const liczbaObserwowanych = lista.filter((p) => p.following).length;

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/tab1" element={<Tab1 />} />
            <Route path="/tab1/:id" element={<PersonDetail />} />
            <Route path="/tab2" element={<Tab2 />} />
            <Route path="/tab3" element={<Tab3 />} />
            <Route path="/" element={<Navigate to="/tab1" replace />} />
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="tab1" href="/tab1">
              <IonIcon aria-hidden="true" icon={people} />
              <IonLabel>Ludzie</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab2" href="/tab2">
              <IonIcon aria-hidden="true" icon={heart} />
              <IonLabel>Obserwowani</IonLabel>
              {liczbaObserwowanych > 0 && <IonBadge color="danger">{liczbaObserwowanych}</IonBadge>}
            </IonTabButton>
            <IonTabButton tab="tab3" href="/tab3">
              <IonIcon aria-hidden="true" icon={create} />
              <IonLabel>Rejestracja</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
