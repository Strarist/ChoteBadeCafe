export type MemoryPinStatus = 'pending' | 'approved' | 'rejected';

export interface MemoryPin {
  id: string;
  names: string;
  story: string;
  /** Public path or absolute URL for the photo */
  imageUrl: string;
  status: MemoryPinStatus;
  staffPick: boolean;
  createdAt: string;
  moderatedAt: string | null;
  rejectReason: string | null;
}
