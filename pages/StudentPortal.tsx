import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Branch, Semester, Subject, Unit, Note } from '../types';
import { ChevronRight, FileText, Download, ArrowLeft, FolderOpen, Layers, Book, Calendar } from 'lucide-react';

const StudentPortal: React.FC = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    const isAdmin = localStorage.getItem('jc_notes_admin') === 'true';
    if (isAdmin) {
      navigate('/admin');
      return;
    }

    const name = localStorage.getItem('student_name');
    if (!name) {
      navigate('/student-login');
    } else {
      setStudentName(name);
    }
  }, [navigate]);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('branches').select('*').order('name');
      if (error) console.error('Error fetching branches:', error);
      else setBranches(data || []);
      setLoading(false);
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      const fetchSemesters = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('semesters')
          .select('*')
          .eq('branch_id', selectedBranch.id)
          .order('name');
        if (error) console.error(error);
        else setSemesters(data || []);
        setLoading(false);
      };
      fetchSemesters();
    } else {
      setSemesters([]);
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (selectedSemester) {
      const fetchSubjects = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('semester_id', selectedSemester.id)
          .order('name');
        if (error) console.error(error);
        else setSubjects(data || []);
        setLoading(false);
      };
      fetchSubjects();
    } else {
      setSubjects([]);
    }
  }, [selectedSemester]);

  useEffect(() => {
    if (selectedSubject) {
      const fetchUnits = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('units')
          .select('*')
          .eq('subject_id', selectedSubject.id)
          .order('name');
        if (error) console.error(error);
        else setUnits(data || []);
        setLoading(false);
      };
      fetchUnits();
    } else {
      setUnits([]);
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedUnit) {
      const fetchNotes = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('unit_id', selectedUnit.id)
          .order('created_at', { ascending: false });
        if (error) console.error(error);
        else setNotes(data || []);
        setLoading(false);
      };
      fetchNotes();
    } else {
      setNotes([]);
    }
  }, [selectedUnit]);

  const resetSelection = (level: 'branch' | 'semester' | 'subject' | 'unit') => {
    if (level === 'branch') {
      setSelectedBranch(null);
      setSelectedSemester(null);
      setSelectedSubject(null);
      setSelectedUnit(null);
    } else if (level === 'semester') {
      setSelectedSemester(null);
      setSelectedSubject(null);
      setSelectedUnit(null);
    } else if (level === 'subject') {
      setSelectedSubject(null);
      setSelectedUnit(null);
    } else if (level === 'unit') {
      setSelectedUnit(null);
    }
  };

  if (!selectedBranch) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            Welcome, <span className="text-primary">{studentName || 'Student'}</span>!
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Select your branch to access lecture notes, presentations, and study materials.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => setSelectedBranch(branch)}
                className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-primary/50 transition-all duration-300 text-center"
              >
                <div className="bg-primary/5 group-hover:bg-primary/10 p-4 rounded-full mb-4 transition-colors">
                  <Layers className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors">{branch.name}</h3>
                <p className="text-sm text-slate-500 mt-2">Click to view semesters</p>
              </button>
            ))}
            {branches.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                No branches found. Ask admin to add some.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!selectedSemester) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => resetSelection('branch')} className="mb-6 flex items-center text-sm text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Branches
        </button>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            <span className="text-primary">{selectedBranch.name}</span> Semesters
          </h2>
          <p className="text-slate-600 mt-2">Select a semester to browse subjects.</p>
        </div>
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {semesters.map((semester) => (
              <button
                key={semester.id}
                onClick={() => setSelectedSemester(semester)}
                className="flex items-center p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all text-left group"
              >
                <div className="bg-indigo-50 group-hover:bg-indigo-100 p-3 rounded-lg mr-4 transition-colors">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="text-lg font-semibold text-slate-800">{semester.name}</span>
                <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
              </button>
            ))}
            {semesters.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                No semesters found for this branch.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!selectedSubject) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => resetSelection('semester')} className="mb-6 flex items-center text-sm text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Semesters
        </button>
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span>{selectedBranch.name}</span>
            <ChevronRight className="w-3 h-3" />
            <span>{selectedSemester.name}</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Subjects</h2>
          <p className="text-slate-600 mt-2">Select a subject to browse units.</p>
        </div>
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject)}
                className="flex items-center p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all text-left"
              >
                <div className="bg-emerald-50 p-3 rounded-lg mr-4">
                  <Book className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-lg font-semibold text-slate-800">{subject.name}</span>
                <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
              </button>
            ))}
            {subjects.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                No subjects found for this semester.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!selectedUnit) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => resetSelection('subject')} className="mb-6 flex items-center text-sm text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Subjects
        </button>
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span>{selectedBranch.name}</span>
            <ChevronRight className="w-3 h-3" />
            <span>{selectedSemester.name}</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">{selectedSubject.name}</h2>
          <p className="text-slate-500 text-sm mt-1">Units</p>
        </div>
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        ) : (
          <div className="space-y-4">
            {units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => setSelectedUnit(unit)}
                className="w-full flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center">
                  <div className="bg-slate-100 group-hover:bg-white p-2 rounded-md mr-4 transition-colors">
                    <FolderOpen className="w-5 h-5 text-slate-600 group-hover:text-primary" />
                  </div>
                  <span className="text-lg font-medium text-slate-700 group-hover:text-slate-900">{unit.name}</span>
                </div>
                <div className="bg-primary/0 group-hover:bg-primary/10 text-primary/0 group-hover:text-primary px-3 py-1 rounded-full text-sm font-medium transition-all">
                  View Notes
                </div>
              </button>
            ))}
            {units.length === 0 && (
              <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200">
                No units found for this subject.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => resetSelection('unit')} className="mb-6 flex items-center text-sm text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Units
      </button>
      <div className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <span>{selectedBranch.name}</span>
          <ChevronRight className="w-3 h-3" />
          <span>{selectedSemester.name}</span>
          <ChevronRight className="w-3 h-3" />
          <span>{selectedSubject.name}</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900">{selectedUnit.name}</h2>
        <p className="text-slate-600 mt-2">Available Notes & Resources</p>
      </div>
      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                    {new Date(note.created_at || '').toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2" title={note.title}>
                  {note.title}
                </h3>
                <p className="text-xs text-slate-500 truncate" title={note.file_name}>
                  {note.file_name}
                </p>
              </div>
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100">
                <a
                  href={note.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download / View
                </a>
              </div>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="bg-slate-50 p-4 rounded-full inline-block mb-3">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">No notes uploaded for this unit yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentPortal;

