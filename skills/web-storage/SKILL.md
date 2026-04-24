# /web-storage

File upload and storage skill for the web-* suite. Covers Supabase Storage buckets, signed URLs, drag-and-drop upload UI, progress tracking, and file management.

**Call this skill when:** any feature requires file uploads (PDFs, images, CSVs, documents, avatars).

**Stack:** Supabase Storage → React upload hook → shadcn/ui primitives.

---

## Phase 0 — Pre-checks

Read SCOPE.md. Answer:
- What file types are uploaded? (images, PDFs, CSV, arbitrary)
- Who can see uploaded files? (owner-only private, org-shared, public)
- Is there a file size limit? (default: 50MB per file)
- Are image uploads transformed? (resizing, thumbnails via Supabase image transforms)
- Is there a virus scan requirement? (enterprise — log as NEEDS_HUMAN)

---

## Phase 1 — Supabase Storage Setup

### 1a — Create buckets via Supabase MCP `apply_migration`

```sql
-- Private bucket: owner-only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-files',
  'user-files',
  false,
  52428800,  -- 50MB
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/csv']
);

-- Public bucket: avatars
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
);
```

### 1b — RLS policies

```sql
-- user-files: owner can CRUD their own files
create policy "Users upload their files" on storage.objects
  for insert with check (
    bucket_id = 'user-files' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users read their files" on storage.objects
  for select using (
    bucket_id = 'user-files' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete their files" on storage.objects
  for delete using (
    bucket_id = 'user-files' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- avatars: public read, owner write
create policy "Avatars are public" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Users upload own avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
```

File path convention: `{bucket}/{userId}/{uuid}.{ext}` — userId as first folder segment enforces RLS.

---

## Phase 2 — Upload Hook

Create `src/hooks/use-file-upload.ts`:

```typescript
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface UploadOptions {
  bucket: string
  folder?: string
  maxSizeMB?: number
  allowedTypes?: string[]
  onSuccess?: (url: string, path: string) => void
  onError?: (error: string) => void
}

interface UploadState {
  uploading: boolean
  progress: number
  error: string | null
  url: string | null
  path: string | null
}

export function useFileUpload(options: UploadOptions) {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    url: null,
    path: null,
  })

  const upload = useCallback(async (file: File) => {
    const maxBytes = (options.maxSizeMB ?? 50) * 1024 * 1024
    if (file.size > maxBytes) {
      const msg = `File too large. Max ${options.maxSizeMB ?? 50}MB.`
      setState(s => ({ ...s, error: msg }))
      options.onError?.(msg)
      return null
    }

    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      const msg = `File type not allowed. Accepted: ${options.allowedTypes.join(', ')}`
      setState(s => ({ ...s, error: msg }))
      options.onError?.(msg)
      return null
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const msg = 'Not authenticated'
      setState(s => ({ ...s, error: msg }))
      options.onError?.(msg)
      return null
    }

    const ext = file.name.split('.').pop()
    const uuid = crypto.randomUUID()
    const folder = options.folder ?? user.id
    const path = `${folder}/${uuid}.${ext}`

    setState({ uploading: true, progress: 0, error: null, url: null, path: null })

    const { error } = await supabase.storage
      .from(options.bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      setState({ uploading: false, progress: 0, error: error.message, url: null, path: null })
      options.onError?.(error.message)
      return null
    }

    let url: string
    if (options.bucket === 'avatars') {
      const { data } = supabase.storage.from(options.bucket).getPublicUrl(path)
      url = data.publicUrl
    } else {
      const { data } = await supabase.storage.from(options.bucket).createSignedUrl(path, 3600)
      url = data?.signedUrl ?? ''
    }

    setState({ uploading: false, progress: 100, error: null, url, path })
    options.onSuccess?.(url, path)
    return { url, path }
  }, [options])

  const remove = useCallback(async (path: string) => {
    const { error } = await supabase.storage.from(options.bucket).remove([path])
    if (error) {
      setState(s => ({ ...s, error: error.message }))
      return false
    }
    setState(s => ({ ...s, url: null, path: null }))
    return true
  }, [options.bucket])

  const reset = useCallback(() => {
    setState({ uploading: false, progress: 0, error: null, url: null, path: null })
  }, [])

  return { ...state, upload, remove, reset }
}
```

---

## Phase 3 — Drag-and-Drop Upload Component

Create `src/components/ui/FileUpload.tsx`:

```tsx
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useFileUpload } from '@/hooks/use-file-upload'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react'

interface FileUploadProps {
  bucket: string
  accept?: Record<string, string[]>
  maxSizeMB?: number
  onUploaded?: (url: string, path: string) => void
  className?: string
}

export function FileUpload({ bucket, accept, maxSizeMB = 50, onUploaded, className }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const { uploading, progress, error, url, upload, reset } = useFileUpload({
    bucket,
    maxSizeMB,
    onSuccess: onUploaded,
  })

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted[0]) return
    setFile(accepted[0])
    await upload(accepted[0])
  }, [upload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: uploading,
  })

  if (url) {
    return (
      <div className={cn('flex items-center gap-3 rounded-lg border p-4 bg-muted/30', className)}>
        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file?.name}</p>
          <p className="text-xs text-muted-foreground">Upload complete</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { reset(); setFile(null) }}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30',
          uploading && 'pointer-events-none opacity-60'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">
            {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max {maxSizeMB}MB
          </p>
        </div>
      </div>

      {uploading && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3 w-3" />{file?.name}
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
```

Install react-dropzone:
```bash
npm install react-dropzone
```

---

## Phase 4 — Avatar Upload (image preview + crop)

For avatar uploads, use a simpler inline component:

```tsx
import { useRef } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useFileUpload } from '@/hooks/use-file-upload'
import { Camera } from 'lucide-react'

interface AvatarUploadProps {
  currentUrl?: string
  fallback: string
  onUploaded: (url: string, path: string) => void
}

export function AvatarUpload({ currentUrl, fallback, onUploaded }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { uploading, upload } = useFileUpload({
    bucket: 'avatars',
    maxSizeMB: 5,
    allowedTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    onSuccess: onUploaded,
  })

  return (
    <div className="relative w-fit">
      <Avatar className="h-20 w-20">
        <AvatarImage src={currentUrl} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <Button
        size="icon"
        variant="secondary"
        className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full shadow-sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <Camera className="h-3.5 w-3.5" />
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (file) await upload(file)
        }}
      />
    </div>
  )
}
```

---

## Phase 5 — Signed URL Refresh

Signed URLs expire (default: 1 hour). For files displayed in the UI, refresh the signed URL on demand:

```typescript
async function refreshSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}
```

For long-lived public access, store the `path` in the database and regenerate the signed URL on page load — don't store the signed URL itself.

---

## Checklist

- [ ] Storage buckets created with appropriate `public` setting
- [ ] RLS policies use `{userId}` as first folder segment
- [ ] File type validation happens both in UI and storage policy
- [ ] Max file size set in bucket config AND in upload hook
- [ ] `useFileUpload` returns upload progress for UX feedback
- [ ] Public bucket URLs retrieved via `getPublicUrl` (no expiry)
- [ ] Private bucket URLs retrieved via `createSignedUrl` (1h expiry)
- [ ] `react-dropzone` installed: `npm install react-dropzone`
- [ ] `path` stored in DB, not the signed URL (URLs expire)
- [ ] File cleanup: remove from Storage when DB record is deleted

---

## Notes

- Supabase Storage uses the same RLS pattern as database tables — bucket policies are SQL
- Image transforms (resize, format): `supabase.storage.from('bucket').getPublicUrl(path, { transform: { width: 200, height: 200, resize: 'cover' } })`
- Large files (>50MB): use chunked multipart upload — Supabase Storage supports it natively
- Virus scanning is not built-in — for compliance, route uploads through ClamAV on an Edge Function
- Never store the Supabase service role key in the browser — storage RLS covers access control for anon/authenticated users
