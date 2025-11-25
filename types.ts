export interface Branch {
  id: string;
  name: string;
  created_at?: string;
}

export interface Semester {
  id: string;
  branch_id: string;
  name: string;
  created_at?: string;
}

export interface Subject {
  id: string;
  semester_id: string;
  name: string;
  created_at?: string;
}

export interface Unit {
  id: string;
  subject_id: string;
  name: string;
  note_count?: number; // Optional note count property for cascading deletes
  created_at?: string;
}

export interface Note {
  id: string;
  unit_id: string;
  title: string;
  file_url: string;
  file_name: string;
  file_path: string; // Used for storage deletion
  unit?: Unit;
  subject?: Subject;
  semester?: Semester;
  branch?: Branch;
  created_at?: string;
}

export interface LoadingState {
  branches: boolean;
  semesters: boolean;
  subjects: boolean;
  units: boolean;
  notes: boolean;
  uploading: boolean;
}
