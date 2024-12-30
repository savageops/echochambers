import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { changelog } from '../changelog';

interface ChangelogState {
    isOpen: boolean;
    lastReadVersion: string;
    hasUnread: boolean;
    setOpen: (open: boolean) => void;
    markAsRead: () => void;
}

export const useChangelog = create<ChangelogState>()(
    persist(
        (set) => ({
            isOpen: false,
            lastReadVersion: '',
            hasUnread: true,
            setOpen: (open) => set({ isOpen: open }),
            markAsRead: () => set({ 
                hasUnread: false, 
                lastReadVersion: changelog[0]?.version || '' 
            }),
        }),
        {
            name: 'changelog-storage',
        }
    )
);
