import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Branch, Semester, Subject, Unit, Note } from '../types';
import Button from '../components/Button';
import { Upload, ChevronRight, Plus, Folder, Layout, BookOpen, Layers, Trash2 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upload' | 'structure'>('upload');
  
  // Data State
  const [branches, setBranches] = useState<Branch[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  
  // Selection State for Structure View
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // New Item Inputs
  const [newBranchName, setNewBranchName] = useState('');
  const [newSemesterName, setNewSemesterName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');

  // Upload Form State
  const [uploadData, setUploadData] = useState({
    branchId: '',
    semesterId: '',
    subjectId: '',
    unitId: '',
    title: '',
  });
  const [file, setFile] = useState<File | null>(null);
  
  // Upload Cascading Dropdown State
  const [uploadSemesters, setUploadSemesters] = useState<Semester[]>([]);
  const [uploadSubjects, setUploadSubjects] = useState<Subject[]>([]);
  const [uploadUnits, setUploadUnits] = useState<Unit[]>([]);

  // Loading States
  const [uploading, setUploading] = useState(false);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

  // Auth Check
  useEffect(() => {
    const isAuth = localStorage.getItem('jc_notes_admin') === 'true';
    if (!isAuth) navigate('/login');
  }, [navigate]);

  // Initial Data Load
  useEffect(() => {
    fetchBranches();
    fetchRecentNotes();
  }, []);

  // --- Fetch Helpers ---
  const fetchBranches = async () => {
    const { data } = await supabase.from('branches').select('*').order('name');
    setBranches(data || []);
  };

  const fetchSemesters = async (branchId: string) => {
    const { data } = await supabase.from('semesters').select('*').eq('branch_id', branchId).order('name');
    return data || [];
  };

  const fetchSubjects = async (semesterId: string) => {
    const { data } = await supabase.from('subjects').select('*').eq('semester_id', semesterId).order('name');
    return data || [];
  };

  const fetchUnits = async (subjectId: string) => {
    const { data } = await supabase.from('units').select('*').eq('subject_id', subjectId).order('name');
    return data || [];
  };

  const fetchRecentNotes = async () => {
    setLoadingNotes(true);
    const { data } = await supabase
      .from('notes')
      .select(`*, units(*, subjects(*, semesters(*, branches(*))))`)
      .order('created_at', { ascending: false })
      .limit(8);
    setRecentNotes(data as Note[] ?? []);
    setLoadingNotes(false);
  };

  // --- Structure Management: Selection Handlers ---
  
  const handleSelectBranch = async (branch: Branch) => {
    setSelectedBranch(branch);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSemesters([]);
    setSubjects([]);
    setUnits([]);
    
    const data = await fetchSemesters(branch.id);
    setSemesters(data);
  };

  const handleSelectSemester = async (semester: Semester) => {
    setSelectedSemester(semester);
    setSelectedSubject(null);
    setSubjects([]);
    setUnits([]);

    const data = await fetchSubjects(semester.id);
    setSubjects(data);
  };

  const handleSelectSubject = async (subject: Subject) => {
    setSelectedSubject(subject);
    setUnits([]);

    const data = await fetchUnits(subject.id);
    setUnits(data);
  };

  // --- Structure Management: Add Handlers ---

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newBranchName.trim()) return;
    const { error } = await supabase.from('branches').insert([{ name: newBranchName }]);
    if (error) alert(error.message);
    else {
      setNewBranchName('');
      fetchBranches();
    }
  };

  const handleAddSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedBranch || !newSemesterName.trim()) return;
    const { error } = await supabase.from('semesters').insert([{ name: newSemesterName, branch_id: selectedBranch.id }]);
    if (error) alert(error.message);
    else {
      setNewSemesterName('');
      const data = await fetchSemesters(selectedBranch.id);
      setSemesters(data);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedSemester || !newSubjectName.trim()) return;
    const { error } = await supabase.from('subjects').insert([{ name: newSubjectName, semester_id: selectedSemester.id }]);
    if (error) alert(error.message);
    else {
      setNewSubjectName('');
      const data = await fetchSubjects(selectedSemester.id);
      setSubjects(data);
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedSubject || !newUnitName.trim()) return;
    const { error } = await supabase.from('units').insert([{ name: newUnitName, subject_id: selectedSubject.id }]);
    if (error) alert(error.message);
    else {
      setNewUnitName('');
      const data = await fetchUnits(selectedSubject.id);
      setUnits(data);
    }
  };


  // --- Upload Tab Handlers ---

  const handleUploadBranchSelect = async (branchId: string) => {
    setUploadData(prev => ({ ...prev, branchId, semesterId: '', subjectId: '', unitId: '' }));
    setUploadSemesters([]);
    setUploadSubjects([]);
    setUploadUnits([]);
    if (branchId) {
      const data = await fetchSemesters(branchId);
      setUploadSemesters(data);
    }
  };

  const handleUploadSemesterSelect = async (semesterId: string) => {
    setUploadData(prev => ({ ...prev, semesterId, subjectId: '', unitId: '' }));
    setUploadSubjects([]);
    setUploadUnits([]);
    if (semesterId) {
      const data = await fetchSubjects(semesterId);
      setUploadSubjects(data);
    }
  };

  const handleUploadSubjectSelect = async (subjectId: string) => {
    setUploadData(prev => ({ ...prev, subjectId, unitId: '' }));
    setUploadUnits([]);
    if (subjectId) {
      const data = await fetchUnits(subjectId);
      setUploadUnits(data);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !uploadData.unitId || !uploadData.title) {
      alert('Please fill all fields and select a file.');
      return;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const filePath = `${uploadData.branchId}/${uploadData.semesterId}/${uploadData.subjectId}/${uploadData.unitId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('notes').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('notes').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('notes').insert([{
        unit_id: uploadData.unitId,
        title: uploadData.title,
        file_name: file.name,
        file_url: publicUrl,
        file_path: filePath
      }]);

      if (dbError) throw dbError;

      alert('Note uploaded successfully!');
      setUploadData(prev => ({ ...prev, title: '' }));
      setFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteNote = async (note: Note) => {
    if (!confirm(`Delete note "${note.title}"?\n\nThis will permanently remove the file and database record.`)) return;

    setDeletingIds(prev => ({ ...prev, [note.id]: true }));

    try {
      console.log('=== Starting deletion process ===');
      console.log('Note ID:', note.id);
      console.log('File path:', note.file_path);

      // Step 1: Delete from storage (if file_path exists)
      if (note.file_path) {
        console.log('Attempting to delete file from storage bucket "notes"...');

        const { data: deleteData, error: storageError } = await supabase.storage
          .from('notes')
          .remove([note.file_path]);

        console.log('Storage delete response:', { data: deleteData, error: storageError });

        if (storageError) {
          console.error('❌ Storage deletion error:', storageError);

          const msg = (storageError.message || '').toLowerCase();
          const status = (storageError as any)?.status || 0;

          console.log('Error details - Status:', status, 'Message:', msg);

          // Check for permission errors
          if (status === 403 || /permission|forbid|not allowed|unauthorized|insufficient|policy/i.test(msg)) {
            alert('❌ Storage deletion failed due to permissions.\n\nYou need to add a DELETE policy in Supabase:\n\n1. Go to Supabase Dashboard → Storage → Policies\n2. Run this SQL in the SQL Editor:\n\ncreate policy "Public delete files"\non storage.objects\nfor delete\nusing ( bucket_id = \'notes\' );\n\nSee supabase-delete-policy.sql file for details.');
            return;
          }

          // If file not found (already deleted), that's OK - proceed to DB delete
          if (/not found|no such file|404/i.test(msg)) {
            console.warn('⚠️ Storage file not found (may already be deleted), proceeding to remove DB record...');
          } else {
            // For other errors, abort to avoid inconsistency
            alert(`❌ Storage deletion failed: ${storageError.message}\n\nCheck browser console for details. Aborting to avoid data inconsistency.`);
            return;
          }
        } else {
          console.log('✅ Storage file deleted successfully');
        }
      } else {
        console.warn('⚠️ No file_path in note record, skipping storage deletion');
      }

      // Step 2: Delete from database
      console.log('Deleting note from database...');
      const { error: dbError } = await supabase
        .from('notes')
        .delete()
        .eq('id', note.id);

      if (dbError) {
        console.error('❌ Database deletion error:', dbError);
        throw dbError;
      }

      console.log('✅ Database record deleted successfully');

      // Step 3: Re-fetch notes to ensure UI is in sync
      console.log('Re-fetching notes list...');
      await fetchRecentNotes();

      console.log('=== Deletion process complete ===');
      alert('✅ Note deleted successfully!');

    } catch (err: any) {
      console.error('❌ Deletion failed with exception:', err);
      alert(`❌ Deletion failed: ${err.message || 'Unknown error'}\n\nCheck browser console for details.`);
    } finally {
      setDeletingIds(prev => ({ ...prev, [note.id]: false }));
    }
  };

  const deleteUnit = async (unit: Unit) => {
    if (!confirm(`Delete unit "${unit.name}" and all its notes?`)) return;
    const { error } = await supabase.from('units').delete().eq('id', unit.id);
    if (error) return alert(error.message);
    setUnits(prev => prev.filter(u => u.id !== unit.id));
    alert('Unit deleted');
  };

  const deleteSubject = async (subject: Subject) => {
    if (!confirm(`Delete subject "${subject.name}" and all its units?`)) return;
    const { error } = await supabase.from('subjects').delete().eq('id', subject.id);
    if (error) return alert(error.message);
    setSubjects(prev => prev.filter(s => s.id !== subject.id));
    alert('Subject deleted');
  };

  const deleteSemester = async (semester: Semester) => {
    if (!confirm(`Delete semester "${semester.name}" and all its subjects?`)) return;
    const { error } = await supabase.from('semesters').delete().eq('id', semester.id);
    if (error) return alert(error.message);
    setSemesters(prev => prev.filter(s => s.id !== semester.id));
    alert('Semester deleted');
  };

  const deleteBranch = async (branch: Branch) => {
    if (!confirm(`Delete branch "${branch.name}" and everything under it?`)) return;
    const { error } = await supabase.from('branches').delete().eq('id', branch.id);
    if (error) return alert(error.message);
    setBranches(prev => prev.filter(b => b.id !== branch.id));
    alert('Branch deleted');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500">Manage your course content efficiently.</p>
        </div>
        <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex">
           <button
             onClick={() => setActiveTab('upload')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
           >
             Upload Notes
           </button>
           <button
             onClick={() => setActiveTab('structure')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'structure' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
           >
             Manage Structure
           </button>
          </div>
        </div>

      {activeTab === 'upload' ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-primary" />
              Upload New Material
            </h2>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white text-slate-700"
                    value={uploadData.branchId}
                    onChange={(e) => handleUploadBranchSelect(e.target.value)}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                   <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
                    value={uploadData.semesterId}
                    onChange={(e) => handleUploadSemesterSelect(e.target.value)}
                    disabled={!uploadData.branchId}
                    required
                  >
                    <option value="">Select Semester</option>
                    {uploadSemesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
                    value={uploadData.subjectId}
                    onChange={(e) => handleUploadSubjectSelect(e.target.value)}
                    disabled={!uploadData.semesterId}
                    required
                  >
                    <option value="">Select Subject</option>
                    {uploadSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
                    value={uploadData.unitId}
                    onChange={(e) => setUploadData({ ...uploadData, unitId: e.target.value })}
                    disabled={!uploadData.subjectId}
                    required
                  >
                    <option value="">Select Unit</option>
                    {uploadUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-slate-700"
                  placeholder="e.g., Chapter 1 Introduction"
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer">
                <input
                  type="file"
                  id="file-upload"
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  required
                />
              </div>

              <Button type="submit" isLoading={uploading} className="w-full py-3">
                Upload Note
              </Button>
            </form>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Recent uploads</h3>
              <button
                onClick={fetchRecentNotes}
                className="text-sm text-primary hover:text-blue-700"
                disabled={loadingNotes}
              >
                Refresh
              </button>
            </div>
            {loadingNotes ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : recentNotes.length === 0 ? (
              <p className="text-sm text-slate-500">No uploads yet.</p>
            ) : (
              <ul className="space-y-4">
                {recentNotes.map(note => (
                  <li key={note.id} className="border border-slate-100 rounded-lg p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">{note.title}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{note.file_name}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {note.branch?.name} / {note.semester?.name} / {note.subject?.name} / {note.unit?.name}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNote(note)}
                        className="text-red-500 hover:text-red-600"
                        disabled={!!deletingIds[note.id]}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
         </div>
       ) : (
        /* STRUCTURE MANAGEMENT TAB */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)] min-h-[500px]">
          
          {/* COLUMN 1: BRANCHES */}
          <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-indigo-500" /> Branches
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {branches.map(branch => (
                <div key={branch.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => handleSelectBranch(branch)}
                    className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${selectedBranch?.id === branch.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {branch.name}
                    <ChevronRight className={`w-4 h-4 ${selectedBranch?.id === branch.id ? 'text-indigo-500' : 'text-slate-300'}`} />
                  </button>
                  <button onClick={() => deleteBranch(branch)} className="text-slate-300 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {branches.length === 0 && <p className="text-xs text-slate-400 p-2 text-center">No branches</p>}
            </div>
            <form onSubmit={handleAddBranch} className="p-3 border-t border-slate-100 bg-white">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="New Branch..." 
                  className="flex-1 text-sm border border-slate-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-primary outline-none"
                  value={newBranchName}
                  onChange={e => setNewBranchName(e.target.value)}
                />
                <button type="submit" className="bg-primary text-white p-1.5 rounded-md hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* COLUMN 2: SEMESTERS */}
          <div className={`flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${!selectedBranch ? 'opacity-50 pointer-events-none' : ''}`}>
             <div className="p-3 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex items-center">
              <Layout className="w-4 h-4 mr-2 text-indigo-500" /> Semesters
            </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {semesters.map(semester => (
                <div key={semester.id} className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectSemester(semester)}
                    className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${selectedSemester?.id === semester.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {semester.name}
                    <ChevronRight className={`w-4 h-4 ${selectedSemester?.id === semester.id ? 'text-indigo-500' : 'text-slate-300'}`} />
                  </button>
                  <button onClick={() => deleteSemester(semester)} className="text-slate-300 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {selectedBranch && semesters.length === 0 && <p className="text-xs text-slate-400 p-2 text-center">No semesters added</p>}
            </div>
            <form onSubmit={handleAddSemester} className="p-3 border-t border-slate-100 bg-white">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="New Semester..." 
                  className="flex-1 text-sm border border-slate-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-primary outline-none"
                  value={newSemesterName}
                  onChange={e => setNewSemesterName(e.target.value)}
                />
                <button type="submit" className="bg-primary text-white p-1.5 rounded-md hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* COLUMN 3: SUBJECTS */}
          <div className={`flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${!selectedSemester ? 'opacity-50 pointer-events-none' : ''}`}>
             <div className="p-3 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-indigo-500" /> Subjects
            </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {subjects.map(subject => (
                <div key={subject.id} className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectSubject(subject)}
                    className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${selectedSubject?.id === subject.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {subject.name}
                    <ChevronRight className={`w-4 h-4 ${selectedSubject?.id === subject.id ? 'text-indigo-500' : 'text-slate-300'}`} />
                  </button>
                  <button onClick={() => deleteSubject(subject)} className="text-slate-300 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {selectedSemester && subjects.length === 0 && <p className="text-xs text-slate-400 p-2 text-center">No subjects added</p>}
            </div>
            <form onSubmit={handleAddSubject} className="p-3 border-t border-slate-100 bg-white">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="New Subject..." 
                  className="flex-1 text-sm border border-slate-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-primary outline-none"
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                />
                <button type="submit" className="bg-primary text-white p-1.5 rounded-md hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* COLUMN 4: UNITS */}
          <div className={`flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${!selectedSubject ? 'opacity-50 pointer-events-none' : ''}`}>
             <div className="p-3 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex items-center">
              <Folder className="w-4 h-4 mr-2 text-indigo-500" /> Units
            </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {units.map(unit => (
                <div
                  key={unit.id}
                  className="flex items-center gap-2"
                >
                  <div
                    className="flex-1 text-left px-3 py-2 rounded-lg text-sm text-slate-600 bg-white border border-transparent hover:border-slate-200 flex items-center"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></div>
                    {unit.name}
                  </div>
                  <button onClick={() => deleteUnit(unit)} className="text-slate-300 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
               {selectedSubject && units.length === 0 && <p className="text-xs text-slate-400 p-2 text-center">No units added</p>}
            </div>
            <form onSubmit={handleAddUnit} className="p-3 border-t border-slate-100 bg-white">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="New Unit..." 
                  className="flex-1 text-sm border border-slate-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-primary outline-none"
                  value={newUnitName}
                  onChange={e => setNewUnitName(e.target.value)}
                />
                <button type="submit" className="bg-primary text-white p-1.5 rounded-md hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
