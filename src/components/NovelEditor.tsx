import React, { useState, useEffect } from 'react'
import { Editor } from 'novel'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command'
import { Plus, Hash, Tag, X } from 'lucide-react'
import { Page, SuperTag } from '../types'

interface NovelEditorProps {
  page: Page
  superTags: SuperTag[]
  onUpdatePage: (updates: Partial<Page>) => void
}

export function NovelEditor({ page, superTags, onUpdatePage }: NovelEditorProps) {
  const [title, setTitle] = useState(page.title)
  const [selectedTags, setSelectedTags] = useState<string[]>(page.tags)
  const [properties, setProperties] = useState<Record<string, any>>(page.properties)
  const [isTagsOpen, setIsTagsOpen] = useState(false)
  const [editorContent, setEditorContent] = useState('')

  // Convert content blocks to HTML for Novel editor
  useEffect(() => {
    const htmlContent = page.content.map(block => {
      switch (block.type) {
        case 'heading1':
          return `<h1>${block.content}</h1>`
        case 'heading2':
          return `<h2>${block.content}</h2>`
        case 'heading3':
          return `<h3>${block.content}</h3>`
        case 'quote':
          return `<blockquote>${block.content}</blockquote>`
        case 'code':
          return `<pre><code>${block.content}</code></pre>`
        case 'bulleted_list':
          return `<ul><li>${block.content}</li></ul>`
        case 'numbered_list':
          return `<ol><li>${block.content}</li></ol>`
        case 'todo': {
          const checked = block.properties?.checked ? 'checked' : ''
          return `<div data-type="taskItem" data-checked="${checked}">${block.content}</div>`
        }
        case 'divider':
          return '<hr>'
        default:
          return `<p>${block.content}</p>`
      }
    }).join('')
    
    setEditorContent(htmlContent)
  }, [page.content])

  const updateTitle = (newTitle: string) => {
    setTitle(newTitle)
    onUpdatePage({ title: newTitle })
  }

  const updateTags = (newTags: string[]) => {
    setSelectedTags(newTags)
    onUpdatePage({ tags: newTags })
    
    // Update properties based on selected tags
    const newProperties = { ...properties }
    const allTagProperties = superTags
      .filter(tag => newTags.includes(tag.id))
      .flatMap(tag => tag.properties)
    
    // Add default values for new tag properties
    allTagProperties.forEach(prop => {
      if (!(prop.name in newProperties) && prop.defaultValue !== undefined) {
        newProperties[prop.name] = prop.defaultValue
      }
    })
    
    setProperties(newProperties)
    onUpdatePage({ properties: newProperties })
  }

  const updateProperty = (name: string, value: any) => {
    const newProperties = { ...properties, [name]: value }
    setProperties(newProperties)
    onUpdatePage({ properties: newProperties })
  }

  const handleEditorUpdate = (content: string) => {
    // Convert HTML back to content blocks (simplified)
    // In a real implementation, you'd want more sophisticated parsing
    onUpdatePage({ 
      content: [{ 
        id: Date.now().toString(), 
        type: 'paragraph', 
        content: content,
        properties: {} 
      }] 
    })
  }

  // Get all properties from selected tags
  const allTagProperties = superTags
    .filter(tag => selectedTags.includes(tag.id))
    .flatMap(tag => tag.properties)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Title */}
      <Input
        value={title}
        onChange={(e) => updateTitle(e.target.value)}
        placeholder="Untitled"
        className="text-4xl font-bold border-none p-0 h-auto bg-transparent focus-visible:ring-0"
      />

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {selectedTags.map(tagId => {
          const tag = superTags.find(t => t.id === tagId)
          if (!tag) return null
          
          const IconComponent = tag.icon === 'hash' ? Hash : Tag
          return (
            <Badge 
              key={tagId} 
              variant="secondary" 
              className="flex items-center gap-1"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              <IconComponent className="w-3 h-3" />
              {tag.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => updateTags(selectedTags.filter(id => id !== tagId))}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )
        })}
        
        <Popover open={isTagsOpen} onOpenChange={setIsTagsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6">
              <Plus className="w-3 h-3 mr-1" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {superTags
                  .filter(tag => !selectedTags.includes(tag.id))
                  .map(tag => {
                    const IconComponent = tag.icon === 'hash' ? Hash : Tag
                    return (
                      <CommandItem
                        key={tag.id}
                        onSelect={() => {
                          updateTags([...selectedTags, tag.id])
                          setIsTagsOpen(false)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded flex items-center justify-center text-white"
                            style={{ backgroundColor: tag.color }}
                          >
                            <IconComponent className="w-2 h-2" />
                          </div>
                          {tag.name}
                        </div>
                      </CommandItem>
                    )
                  })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Dynamic Properties from Super Tags */}
      {allTagProperties.length > 0 && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-sm text-gray-700">Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTagProperties.map(prop => (
              <div key={prop.id}>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  {prop.name}
                  {prop.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {prop.type === 'text' && (
                  <Input
                    value={properties[prop.name] || ''}
                    onChange={(e) => updateProperty(prop.name, e.target.value)}
                    placeholder={`Enter ${prop.name.toLowerCase()}...`}
                  />
                )}
                {prop.type === 'number' && (
                  <Input
                    type="number"
                    value={properties[prop.name] || ''}
                    onChange={(e) => updateProperty(prop.name, Number(e.target.value))}
                    placeholder={`Enter ${prop.name.toLowerCase()}...`}
                  />
                )}
                {prop.type === 'date' && (
                  <Input
                    type="date"
                    value={properties[prop.name] || ''}
                    onChange={(e) => updateProperty(prop.name, e.target.value)}
                  />
                )}
                {prop.type === 'checkbox' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={properties[prop.name] || false}
                      onChange={(e) => updateProperty(prop.name, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Yes</span>
                  </div>
                )}
                {(prop.type === 'select' || prop.type === 'multi_select') && prop.options && (
                  <select
                    value={properties[prop.name] || ''}
                    onChange={(e) => updateProperty(prop.name, e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select {prop.name.toLowerCase()}...</option>
                    {prop.options.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Novel Editor with Slash Commands */}
      <div className="min-h-[400px] border rounded-lg p-4">
        <Editor
          defaultValue={editorContent}
          onUpdate={(editor) => {
            const html = editor?.getHTML() || ''
            handleEditorUpdate(html)
          }}
          editorProps={{
            attributes: {
              class: 'prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full min-h-[350px] p-4',
            },
          }}
          slashCommand={{
            suggestion: {
              items: ({ query }) => {
                const items = [
                  {
                    title: 'Text',
                    description: 'Just start typing with plain text.',
                    searchTerms: ['p', 'paragraph'],
                    icon: <Hash className="w-4 h-4" />,
                    command: ({ editor, range }) => {
                      editor.chain().focus().deleteRange(range).toggleNode('paragraph', 'paragraph').run()
                    },
                  },
                  {
                    title: 'Heading 1',
                    description: 'Big section heading.',
                    searchTerms: ['title', 'big', 'large'],
                    icon: <Hash className="w-4 h-4" />,
                    command: ({ editor, range }) => {
                      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
                    },
                  },
                  {
                    title: 'Heading 2',
                    description: 'Medium section heading.',
                    searchTerms: ['subtitle', 'medium'],
                    icon: <Hash className="w-4 h-4" />,
                    command: ({ editor, range }) => {
                      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
                    },
                  },
                  {
                    title: 'Heading 3',
                    description: 'Small section heading.',
                    searchTerms: ['subtitle', 'small'],
                    icon: <Hash className="w-4 h-4" />,
                    command: ({ editor, range }) => {
                      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
                    },
                  },
                  {
                    title: 'Bullet List',
                    description: 'Create a simple bullet list.',
                    searchTerms: ['unordered', 'point'],
                    icon: <Hash className="w-4 h-4" />,
                    command: ({ editor, range }) => {
                      editor.chain().focus().deleteRange(range).toggleBulletList().run()
                    },
                  },
                  {
                    title: 'Numbered List',
                    description: 'Create a list with numbering.',
                    searchTerms: ['ordered'],
                    icon: <Hash className="w-4 h-4" />,
                    command: ({ editor, range }) => {
                      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
                    },
                  },
                  {
                    title: 'Quote',
                    description: 'Capture a quote.',
                    searchTerms: ['blockquote'],
                    icon: <Hash className="w-4 h-4" />,
                    command: ({ editor, range }) => {
                      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
                    },
                  },
                  {
                    title: 'Code',
                    description: 'Capture a code snippet.',
                    searchTerms: ['codeblock'],
                    icon: <Hash className="w-4 h-4" />,
                    command: ({ editor, range }) => {
                      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
                    },
                  },
                ]

                return items.filter(item => {
                  if (typeof query === 'string' && query.length > 0) {
                    const search = query.toLowerCase()
                    return (
                      item.title.toLowerCase().includes(search) ||
                      item.description.toLowerCase().includes(search) ||
                      (item.searchTerms && item.searchTerms.some(term => term.includes(search)))
                    )
                  }
                  return true
                })
              },
            },
          }}
        />
      </div>
    </div>
  )
}