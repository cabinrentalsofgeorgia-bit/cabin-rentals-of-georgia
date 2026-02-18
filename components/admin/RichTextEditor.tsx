'use client'

import { useEffect, useState, useRef } from 'react'
import { uploadImage } from '@/lib/api/media'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
}

// Custom upload adapter for CKEditor - defined outside component to avoid recreation
class CustomUploadAdapter {
  loader: any
  onUploadStart?: () => void
  onUploadEnd?: () => void

  constructor(loader: any, onUploadStart?: () => void, onUploadEnd?: () => void) {
    this.loader = loader
    this.onUploadStart = onUploadStart
    this.onUploadEnd = onUploadEnd
  }

  async upload() {
    try {
      // Notify upload start
      if (this.onUploadStart) {
        this.onUploadStart()
      }

      // Get the file from the loader
      // The loader.file is a Promise that resolves to a File object
      const file = await this.loader.file
      
      if (!file) {
        if (this.onUploadEnd) {
          this.onUploadEnd()
        }
        throw new Error('No file provided')
      }

      console.log('Uploading image:', file.name, file.type, file.size)

      // Upload image using the existing API
      const response = await uploadImage(file, {
        image_type: 'blog', // Blog images upload to images/users/u13
        create_thumbnail: false,
      })

      console.log('Image upload response:', response)

      // Return the URL that CKEditor should use
      // Use original_url for better quality in blog posts
      const imageUrl = response.original_url || response.url
      
      if (!imageUrl) {
        throw new Error('No image URL returned from server')
      }
      
      // The API returns relative paths like /images/...
      // Next.js will rewrite these to the R2 public URL automatically
      // For CKEditor, we can use the relative path or construct absolute URL
      let finalUrl = imageUrl
      
      // If it's already an absolute URL, use it as-is
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
        // If we have a public URL configured, use it; otherwise use relative path
        // Relative paths work because Next.js rewrites /images/* to R2
        const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
        if (r2PublicUrl) {
          finalUrl = `${r2PublicUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
        }
        // If no R2_PUBLIC_URL, the relative path should still work via Next.js rewrites
      }

      console.log('Final image URL:', finalUrl)

      // Notify upload end
      if (this.onUploadEnd) {
        this.onUploadEnd()
      }

      return {
        default: finalUrl,
      }
    } catch (error: any) {
      console.error('Error uploading image:', error)
      
      // Notify upload end even on error
      if (this.onUploadEnd) {
        this.onUploadEnd()
      }
      
      // Re-throw with a user-friendly message
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to upload image'
      throw new Error(errorMessage)
    }
  }

  abort() {
    // Handle abort if needed - CKEditor will call this if upload is cancelled
  }
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = 300,
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null)
  const [editorLoaded, setEditorLoaded] = useState(false)
  const [Editor, setEditor] = useState<any>(null)
  const [CKEditor, setCKEditor] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    // Dynamically import CKEditor to avoid SSR issues
    const loadEditor = async () => {
      try {
        const ckeditorReact = await import('@ckeditor/ckeditor5-react')
        const ClassicEditor = (await import('@ckeditor/ckeditor5-build-classic')).default
        
        // Set up the upload adapter factory on the editor class
        // This needs to be done before creating editor instances
        if (ClassicEditor && ClassicEditor.builtinPlugins) {
          // The upload adapter will be set in onReady for each editor instance
        }
        
        setCKEditor(() => ckeditorReact.CKEditor)
        setEditor(() => ClassicEditor)
        setEditorLoaded(true)
      } catch (error) {
        console.error('Error loading CKEditor:', error)
      }
    }

    loadEditor()
  }, [])

  if (!editorLoaded || !Editor || !CKEditor) {
    return (
      <div 
        className="border border-slate-300 rounded-lg bg-slate-50 animate-pulse"
        style={{ minHeight: `${minHeight}px` }}
      >
        <div className="h-10 bg-slate-200 rounded-t-lg" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
        </div>
      </div>
    )
  }

  return (
    <div className="ckeditor-wrapper relative">
      {/* Loading overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-[100] flex items-center justify-center rounded-lg pointer-events-none">
          <div className="flex flex-col items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-lg border border-amber-200 pointer-events-auto">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-amber-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-slate-700">Uploading image...</p>
            <p className="text-xs text-slate-500">Please wait</p>
          </div>
        </div>
      )}
      <style jsx global>{`
        .ckeditor-wrapper .ck-editor__editable {
          min-height: ${minHeight}px;
        }
        .ckeditor-wrapper .ck-editor__editable:focus {
          border-color: #f59e0b !important;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2) !important;
        }
        .ckeditor-wrapper .ck.ck-editor {
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .ckeditor-wrapper .ck.ck-toolbar {
          background: #f8fafc !important;
          border-color: #e2e8f0 !important;
        }
        .ckeditor-wrapper .ck.ck-editor__main > .ck-editor__editable {
          background: white;
          border-color: #e2e8f0 !important;
        }
        .ckeditor-wrapper .ck.ck-button:not(.ck-disabled):hover,
        .ckeditor-wrapper .ck.ck-button.ck-on {
          background: #fef3c7 !important;
        }
        .ckeditor-wrapper .ck.ck-button.ck-on {
          color: #d97706 !important;
        }
        /* Source editing mode styling */
        .ckeditor-wrapper .ck-source-editing-area textarea {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 13px;
          line-height: 1.5;
          background: #1e293b !important;
          color: #e2e8f0 !important;
          border: none !important;
        }

        .ckeditor-wrapper * {
            margin: revert;
            padding: revert;
            list-style: revert;
            font-family: revert;
            font-size: revert;
            line-height: revert;
            color: black;
            background: revert;
            border: revert;
            font-weight: revert;
            font-style: revert;
        }

        .ckeditor-wrapper a {
            color: #0074BD;
        }

        .ckeditor-wrapper a:hover {
            cursor: pointer;
            text-decoration: underline;
        }
      `}</style>
      <CKEditor
        editor={Editor}
        data={value}
        config={{
          placeholder: placeholder,
          toolbar: {
            items: [
              'undo', 'redo',
              '|',
              'heading',
              '|',
              'bold', 'italic', 'underline', 'strikethrough',
              '|',
              'fontSize', 'fontColor', 'fontBackgroundColor',
              '|',
              'link', 'insertImage', 'insertTable', 'mediaEmbed',
              '|',
              'alignment',
              '|',
              'bulletedList', 'numberedList',
              '|',
              'outdent', 'indent',
              '|',
              'blockQuote', 'horizontalLine',
              '|',
              'removeFormat',
              '|',
              'sourceEditing',
            ],
            shouldNotGroupWhenFull: true,
          },
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
              { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            ],
          },
          fontSize: {
            options: ['tiny', 'small', 'default', 'big', 'huge'],
            supportAllValues: true,
          },
          image: {
            toolbar: [
              'imageTextAlternative',
              'toggleImageCaption',
              '|',
              'imageStyle:inline',
              'imageStyle:block',
              'imageStyle:side',
              '|',
              'resizeImage',
            ],
            insert: {
              type: 'auto',
            },
          },
          table: {
            contentToolbar: [
              'tableColumn',
              'tableRow',
              'mergeTableCells',
              'tableProperties',
              'tableCellProperties',
            ],
          },
          link: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'https://',
          },
        }}
        onChange={(_event: any, editor: any) => {
          const data = editor.getData()
          onChange(data)
        }}
        onReady={(editor: any) => {
          editorRef.current = editor
          
          // Configure custom upload adapter for images
          // This must be set up when the editor is ready
          try {
            const fileRepository = editor.plugins.get('FileRepository')
            if (fileRepository) {
              // Set the upload adapter factory
              fileRepository.createUploadAdapter = (loader: any) => {
                console.log('Creating upload adapter for image upload')
                return new CustomUploadAdapter(
                  loader,
                  () => setIsUploading(true),  // onUploadStart
                  () => setIsUploading(false)  // onUploadEnd
                )
              }
              console.log('Upload adapter configured successfully')
            } else {
              console.warn('FileRepository plugin not found')
            }
          } catch (error) {
            console.error('Error setting up upload adapter:', error)
          }
        }}
      />
    </div>
  )
}
