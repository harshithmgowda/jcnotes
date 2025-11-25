import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import pino from 'pino';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server environment');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

export async function deleteNoteHandler(req: Request, res: Response, logger: pino.Logger) {
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ success: false, message: 'Missing id in body' });

  // Auth: validate incoming bearer token and ensure user is in ADMIN_EMAILS
  const authHeader = (req.headers.authorization || '').replace(/^Bearer\s*/i, '');
  if (!authHeader) return res.status(401).json({ success: false, message: 'Missing Authorization header' });

  try {
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(authHeader as string);
    if (userErr) {
      logger.warn({ err: userErr }, 'Failed to get user from token');
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const user = userData?.user;
    const userEmail = user?.email || '';
    if (!ADMIN_EMAILS.includes(userEmail)) {
      logger.warn({ userEmail }, 'Unauthorized delete attempt');
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Fetch note
    const { data: noteData, error: noteErr } = await supabaseAdmin
      .from('notes')
      .select('id, file_path')
      .eq('id', id)
      .single();

    if (noteErr && noteErr.code !== 'PGRST116') {
      logger.error(noteErr, 'Error fetching note');
      return res.status(500).json({ success: false, message: 'Error fetching note' });
    }

    if (!noteData) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const filePath = (noteData as any).file_path as string | null;

    // If filePath exists, attempt to delete storage object
    if (filePath) {
      try {
        // File path stored as <branch>/<semester>/.../filename
        const { error: removeErr } = await supabaseAdmin.storage.from('notes').remove([filePath]);
        if (removeErr) {
          // If object not found, treat as success; for permission errors, return 500
          const msg = (removeErr.message || '').toLowerCase();
          if (/not found|404|no such file/i.test(msg)) {
            logger.warn({ filePath }, 'Storage file already missing');
          } else {
            logger.error(removeErr, 'Failed to remove file from storage');
            return res.status(500).json({ success: false, message: 'Failed to remove file from storage', detail: removeErr.message });
          }
        }
      } catch (err: any) {
        logger.error(err, 'Exception while removing file from storage');
        return res.status(500).json({ success: false, message: 'Storage remove exception' });
      }
    }

    // Now delete DB row
    const { error: delErr } = await supabaseAdmin.from('notes').delete().eq('id', id);
    if (delErr) {
      logger.error(delErr, 'Failed to delete note record');
      return res.status(500).json({ success: false, message: 'Failed to delete DB record', detail: delErr.message });
    }

    logger.info({ id, userEmail }, 'Deleted note successfully');
    return res.json({ success: true, message: 'Deleted' });

  } catch (err: any) {
    logger.error(err, 'Unhandled exception in delete handler');
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

