# /web-pdf

PDF generation skill for the web-* suite. Covers browser-based PDF generation (Puppeteer via Edge Function), React-PDF for structured reports, and download UX.

**Call this skill when:** any feature needs to export data as PDF — audit reports, invoices, certificates, data exports.

**Stack:** `@react-pdf/renderer` (structured layouts) OR Puppeteer via Supabase Edge Function (HTML-to-PDF). Choose based on output type.

---

## Phase 0 — Choose the Right Approach

| Approach | Use when | Output quality |
|---|---|---|
| `@react-pdf/renderer` | Structured reports, tables, branded layouts with precise control | High — designed for documents |
| Puppeteer HTML-to-PDF | Already have a web page that looks right, need pixel-perfect capture | Exact browser render |
| Browser `window.print()` | Simple one-off export, no server needed | Low — layout often breaks |

**Default for SaaS:** `@react-pdf/renderer` for report-style PDFs. Puppeteer for visual page captures.

---

## Phase 1 — React-PDF (Structured Reports)

Install:
```bash
npm install @react-pdf/renderer
```

### 1a — PDF Document Component

Create `src/components/pdf/AuditReportPDF.tsx`:

```tsx
import {
  Document, Page, Text, View, StyleSheet, Font, Image,
  PDFDownloadLink, PDFViewer,
} from '@react-pdf/renderer'

// Register fonts (optional — system fonts work without this)
// Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.ttf' })

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1a1a1a',
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottom: '1 solid #e5e7eb',
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  meta: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'right',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: '1 solid #f3f4f6',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    padding: '8 12',
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  scoreLabel: {
    fontSize: 10,
    color: '#374151',
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  finding: {
    marginBottom: 10,
    padding: '10 12',
    backgroundColor: '#fef2f2',
    borderRadius: 4,
    borderLeft: '3 solid #ef4444',
  },
  findingTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 3,
  },
  findingBody: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: '1 solid #f3f4f6',
    paddingTop: 8,
  },
})

interface AuditReportData {
  productName: string
  url: string
  date: string
  scores: Record<string, number>
  findings: Array<{ title: string; description: string; severity: 'critical' | 'high' | 'medium' | 'low' }>
}

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#6b7280',
}

export function AuditReportDocument({ data }: { data: AuditReportData }) {
  return (
    <Document title={`${data.productName} Audit Report`} author="AuditHQ">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>AuditHQ</Text>
          <View style={styles.meta}>
            <Text>{data.date}</Text>
            <Text>{data.url}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{data.productName}</Text>
        <Text style={styles.subtitle}>Website Audit Report</Text>

        {/* Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scores</Text>
          {Object.entries(data.scores).map(([key, value]) => (
            <View key={key} style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>{key}</Text>
              <Text style={[styles.scoreValue, { color: value >= 70 ? '#16a34a' : value >= 50 ? '#ca8a04' : '#dc2626' }]}>
                {value}/100
              </Text>
            </View>
          ))}
        </View>

        {/* Findings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Findings</Text>
          {data.findings.map((f, i) => (
            <View key={i} style={[styles.finding, { borderLeftColor: SEVERITY_COLORS[f.severity] }]}>
              <Text style={[styles.findingTitle, { color: SEVERITY_COLORS[f.severity] }]}>
                [{f.severity.toUpperCase()}] {f.title}
              </Text>
              <Text style={styles.findingBody}>{f.description}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated by AuditHQ</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
```

### 1b — Download Button

```tsx
import { PDFDownloadLink } from '@react-pdf/renderer'
import { AuditReportDocument } from '@/components/pdf/AuditReportPDF'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

export function DownloadReportButton({ data }: { data: AuditReportData }) {
  return (
    <PDFDownloadLink
      document={<AuditReportDocument data={data} />}
      fileName={`${data.productName.toLowerCase().replace(/\s+/g, '-')}-audit-${data.date}.pdf`}
    >
      {({ loading }) => (
        <Button disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {loading ? 'Generating...' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
```

### 1c — Preview in Modal

```tsx
import { PDFViewer } from '@react-pdf/renderer'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export function PDFPreviewModal({ data, open, onClose }: {
  data: AuditReportData
  open: boolean
  onClose: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0">
        <PDFViewer width="100%" height="100%" className="rounded-lg">
          <AuditReportDocument data={data} />
        </PDFViewer>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Phase 2 — Puppeteer HTML-to-PDF (via Supabase Edge Function)

Use when you need exact browser rendering — e.g. capturing a page that already looks good.

Create `supabase/functions/generate-pdf/index.ts`:

```typescript
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts'
import { createClient } from 'npm:@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401 })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { url, filename = 'export.pdf' } = await req.json()
  if (!url) return new Response('url is required', { status: 400 })

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
  })

  await browser.close()

  return new Response(pdf, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
})
```

**Note:** Puppeteer on Deno Edge Functions requires significant memory. Check Supabase Edge Function limits before using for production. For high-volume PDF generation, run Puppeteer on a dedicated compute instance instead.

---

## Phase 3 — Client-side Download Trigger (for Puppeteer approach)

```typescript
async function downloadPDF(auditUrl: string, filename: string) {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-pdf`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ url: auditUrl, filename }),
    }
  )

  if (!response.ok) throw new Error('PDF generation failed')

  const blob = await response.blob()
  const downloadUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = filename
  a.click()
  URL.revokeObjectURL(downloadUrl)
}
```

---

## Phase 4 — Bundle Split (important)

`@react-pdf/renderer` is ~400KB gzipped. Always lazy load it:

In `vite.config.ts`, add to `manualChunks`:
```typescript
'vendor-pdf': ['@react-pdf/renderer'],
```

And lazy load the components that use it:
```tsx
const AuditReportDocument = lazy(() =>
  import('@/components/pdf/AuditReportPDF').then(m => ({ default: m.AuditReportDocument }))
)
const PDFDownloadLink = lazy(() =>
  import('@react-pdf/renderer').then(m => ({ default: m.PDFDownloadLink }))
)
```

---

## Checklist

- [ ] Approach chosen: `@react-pdf/renderer` (structured) or Puppeteer (visual capture)
- [ ] `@react-pdf/renderer` in `manualChunks` as `vendor-pdf` — never in main bundle
- [ ] All PDF components lazy-loaded (react-pdf is large)
- [ ] `PDFDownloadLink` shows loading state while generating
- [ ] Filename is meaningful: `{product}-{date}.pdf`, not `document.pdf`
- [ ] Footer shows page numbers using `render` prop with `pageNumber`/`totalPages`
- [ ] For Puppeteer: auth header sent to Edge Function, user verified before generation
- [ ] PDFViewer only rendered in browser (not SSR-safe — wrap in `useEffect` or lazy load)

---

## Notes

- `@react-pdf/renderer` uses Yoga layout (same as React Native) — CSS grid/flexbox quirks apply
- `PDFViewer` uses an iframe — it will not render server-side; always lazy-load it
- For fonts: use `Font.register()` with a URL to a `.ttf` or `.woff` file — system fonts are not reliably available
- Emoji and special characters: requires a font that includes them (e.g. Noto Sans)
- Page breaks: use `break` style on `View` components, or `wrap={false}` to prevent breaking inside a section
- Puppeteer on Edge Functions: cold start is 3-8 seconds — show a loading state and consider caching generated PDFs in Supabase Storage
