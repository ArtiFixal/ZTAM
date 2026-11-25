import { create } from 'zustand';

import { people, type Person } from '../data/people';

type PeopleState = {
  people: Person[];
  toggleFollowing: (id: number) => void;
  addPerson: (person: Person) => void;
};

export const usePeopleStore = create<PeopleState>()((set) => ({
  people: people,
  toggleFollowing: (id) =>
    set((state) => ({
      people: state.people.map((p) => (p.id === id ? { ...p, following: !p.following } : p)),
    })),
  addPerson: (person) => set((state) => ({ people: [person, ...state.people] })),
}));
