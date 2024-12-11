'use client'

import { useState, useEffect, useRef } from 'react'
import { Template, SavedScript } from '@/types'
import { FormattingToolbar } from '@/components/FormattingToolbar'
import { Check } from 'lucide-react'
import BackButton from '@/components/BackButton'

interface ScriptEditorProps {
  template: Template | null
  uploadedContent?: string
  editingScript: SavedScript | null
  onSave: (script: string) => void
  handleGoBack: () => void
  onRename?: (scriptId: string, newName: string) => void
}

export default function ScriptEditor({
  template,
  uploadedContent,
  editingScript,
  onSave,
  handleGoBack,
  onRename
}: ScriptEditorProps) {
  const [script, setScript] = useState<string>('')
  const [originalScript, setOriginalScript] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [editableName, setEditableName] = useState<string>('')
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let content = ''
    if (editingScript) {
      content = editingScript.content
    } else if (template) {
      content = template.fullScript
    } else if (uploadedContent) {
      content = uploadedContent
    }
    setScript(content)
    setOriginalScript(content)
    setHistory([content])

    if (editorRef.current) {
      editorRef.current.innerHTML = content
    }
  }, [template, uploadedContent, editingScript])

  useEffect(() => {
    setEditableName(editingScript ? editingScript.name : (template ? template.title : 'Uploaded Script'));
  }, [editingScript, template]);

  const handleSave = async () => {
    if (!editorRef.current) return;
    
    setIsSaving(true)
    try {
      await onSave(editorRef.current.innerHTML)
      setShowSaveConfirmation(true)
      setTimeout(() => setShowSaveConfirmation(false), 2000)
      setOriginalScript(editorRef.current.innerHTML)
      setHistory([editorRef.current.innerHTML])
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving script:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRevert = () => {
    if (history.length > 1) {
      const newHistory = [...history]
      newHistory.pop()
      const previousState = newHistory[newHistory.length - 1]
      if (editorRef.current) {
        editorRef.current.innerHTML = previousState
      }
      setScript(previousState)
      setHistory(newHistory)
      setHasChanges(newHistory.length > 1)
    } else if (history.length === 1) {
      if (editorRef.current) {
        editorRef.current.innerHTML = originalScript
      }
      setScript(originalScript)
      setHistory([originalScript])
      setHasChanges(false)
    }
  }

  const handleInput = () => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML
      if (currentContent !== script) {
        setScript(currentContent)
        setHistory(prev => [...prev, currentContent])
        setHasChanges(true)
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const handleNameSave = () => {
    if (editingScript && onRename) {
      onRename(editingScript.id, editableName);
    }
  };

  return (
    <div className="dynamic-height-container">
      <div className="px-4 mb-1">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={editableName}
            onChange={(e) => setEditableName(e.target.value)}
            onBlur={onRename ? handleNameSave : undefined}
            className="text-[16px] md:text-[14px] sm:text-[12px] font-montserrat font-semibold text-left bg-transparent border-b border-transparent focus:border-[#5b06be] focus:outline-none"
          />
        </div>
      </div>
      <div className="dynamic-height-content bg-white rounded-[20px] mb-2 p-2 relative">
        <div className="relative bg-[#f2f3f8] rounded-[20px] border-2 border-[#f2f3f8] overflow-hidden">
          <FormattingToolbar
            editorRef={editorRef}
            onRevert={handleRevert}
            hasChanges={hasChanges}
          />
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onPaste={handlePaste}
            className="scrollable-content w-full min-h-[300px] px-6 pt-4 pb-6 font-montserrat text-sm md:text-xs sm:text-xs text-gray-800 focus:outline-none overflow-y-auto
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3
              [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2
              [&_p]:mb-4 [&_p]:last:mb-0"
          />
        </div>
      </div>
      <div className="flex items-center justify-between px-4">
        <BackButton onClick={handleGoBack} />
        <button
          onClick={handleSave}
          className={`text-white h-[45px] px-6 rounded-[20px] font-montserrat font-semibold transition-all duration-300 flex items-center justify-center bg-[#f8bd30] text-sm md:text-xs ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
        >
          {isSaving ? 'Saving...' : 'Save Script'}
        </button>
      </div>
      {showSaveConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
          <div className="bg-white p-4 rounded-[20px] flex items-center shadow-lg">
            <Check className="text-[#5b06be] w-6 h-6 mr-3" />
            <span className="font-montserrat font-semibold text-sm sm:text-base">
              Script Saved Successfully!
            </span>
          </div>
        </div>
      )}
    </div>
  )
}