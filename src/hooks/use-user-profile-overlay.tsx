'use client';

import * as React from 'react';
import { UserProfileOverlay } from '@/components/UserProfileOverlay';

export type UserProfileSection = 'account' | 'billing' | 'security';

type UserProfileOverlayContextValue = {
  openUserProfile: (section?: UserProfileSection) => void;
};

const UserProfileOverlayContext = React.createContext<UserProfileOverlayContextValue | null>(null);

export function useUserProfileOverlay() {
  const context = React.useContext(UserProfileOverlayContext);

  if (!context) {
    throw new Error('useUserProfileOverlay must be used within UserProfileOverlayProvider');
  }

  return context;
}

export function UserProfileOverlayProvider(props: { children: React.ReactNode }) {
  const [section, setSection] = React.useState<UserProfileSection | null>(null);

  const openUserProfile = (nextSection: UserProfileSection = 'account') => {
    setSection(nextSection);
  };

  return (
    <UserProfileOverlayContext value={{ openUserProfile }}>
      {props.children}
      {section ? (
        <UserProfileOverlay
          section={section}
          onClose={() => {
            setSection(null);
          }}
        />
      ) : null}
    </UserProfileOverlayContext>
  );
}
